import type { MatchFilters, SupportProfile } from '../domain/profile';

/**
 * Pure eligibility matching. No percentages: a program is a strong potential match, a possible
 * match, or needs more information — and every label is backed by explicit reasons the person
 * can read (✓ fits, ? needs checking, ! may not qualify). Reasons are i18n keys; the web app
 * owns the wording.
 */

export type Fit = 'strong' | 'possible' | 'needs_info';
export type ReasonKind = 'yes' | 'unknown' | 'risk';

export interface MatchReason {
  kind: ReasonKind;
  key: string;
  params?: Record<string, string>;
}

export interface MatchOutcome {
  programId: string;
  fit: Fit;
  score: number;
  reasons: MatchReason[];
}

/** The subset of a Program row the matcher reads. */
export interface MatchableProgram {
  id: string;
  supportTypes: string[];
  genders: string[];
  ageMin: number | null;
  ageMax: number | null;
  regions: string[];
  targetCircumstances: string[];
  requiredCircumstances: string[];
  incomeTested: boolean;
  applicationStatus: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  deadline: Date | null;
  statusVerifiedAt: Date | null;
  isDraft: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const DEADLINE_SOON_DAYS = 14;
export const STALE_AFTER_DAYS = 60;

const FIT_RANK: Record<Fit, number> = { strong: 0, possible: 1, needs_info: 2 };

export function isAcceptingApplications(program: MatchableProgram, now: Date): boolean {
  if (program.applicationStatus !== 'OPEN') return false;
  return !program.deadline || program.deadline.getTime() >= now.getTime();
}

/** Returns null when the program clearly doesn't apply (wrong need, region, age, gender). */
export function matchProgram(
  program: MatchableProgram,
  profile: SupportProfile,
  now: Date,
): MatchOutcome | null {
  if (program.isDraft) return null;

  const reasons: MatchReason[] = [];
  let hardUnknowns = 0;
  let blockingRisks = 0;
  let requiredUnknown = false;

  // Need — the one thing the person always tells us first.
  const overlap = program.supportTypes.filter((type) =>
    profile.needs.includes(type as SupportProfile['needs'][number]),
  );
  if (profile.needs.length > 0 && overlap.length === 0) return null;
  for (const supportType of overlap.slice(0, 2)) {
    reasons.push({ kind: 'yes', key: 'need', params: { supportType } });
  }

  // Gender — a platform for women and families; we never ask, only exclude on an explicit mismatch.
  if (program.genders.length > 0) {
    if (profile.gender && !program.genders.includes(profile.gender)) return null;
    if (program.genders.length === 1 && program.genders[0] === 'female') {
      reasons.push({ kind: 'yes', key: 'forWomen' });
    }
  }

  // Region.
  if (program.regions.length === 0) {
    reasons.push({ kind: 'yes', key: 'nationwide' });
  } else if (profile.region) {
    if (!program.regions.includes(profile.region)) return null;
    reasons.push({ kind: 'yes', key: 'inRegion', params: { region: profile.region } });
  } else {
    hardUnknowns += 1;
    reasons.push({ kind: 'unknown', key: 'regionCheck', params: { regions: program.regions.join(',') } });
  }

  // Age — the person's age may be a band (tapped) or exact (typed).
  if (program.ageMin !== null || program.ageMax !== null) {
    const min = program.ageMin ?? 0;
    const max = program.ageMax ?? 120;
    const ageParams = { min: String(min), max: String(max) };
    if (profile.ageMin !== undefined && profile.ageMax !== undefined) {
      if (profile.ageMax < min || profile.ageMin > max) return null;
      if (profile.ageMin >= min && profile.ageMax <= max) {
        reasons.push({ kind: 'yes', key: 'ageFits', params: ageParams });
      } else {
        // The person's age band straddles the limit — we genuinely don't know yet.
        hardUnknowns += 1;
        reasons.push({ kind: 'risk', key: 'ageBorder', params: ageParams });
      }
    } else {
      hardUnknowns += 1;
      reasons.push({ kind: 'unknown', key: 'ageLimit', params: ageParams });
    }
  }

  // Required circumstances (e.g. enrolled student).
  let requiredMet = 0;
  for (const circumstance of program.requiredCircumstances) {
    const c = circumstance as SupportProfile['circumstances'][number];
    if (profile.circumstances.includes(c)) {
      requiredMet += 1;
      reasons.push({ kind: 'yes', key: 'hasCircumstance', params: { circumstance } });
    } else if (profile.notCircumstances.includes(c)) {
      return null;
    } else {
      hardUnknowns += 1;
      requiredUnknown = true;
      reasons.push({ kind: 'unknown', key: 'confirmCircumstance', params: { circumstance } });
    }
  }

  // Groups the program is designed for.
  const targetMatches = program.targetCircumstances.filter((c) =>
    profile.circumstances.includes(c as SupportProfile['circumstances'][number]),
  );
  for (const circumstance of targetMatches.slice(0, 2)) {
    reasons.push({ kind: 'yes', key: 'targetGroup', params: { circumstance } });
  }

  // Income can only ever be confirmed by the organization.
  if (program.incomeTested) {
    reasons.push({ kind: 'unknown', key: 'income' });
  }

  // Application status and freshness — never hide stale data.
  const accepting = isAcceptingApplications(program, now);
  if (program.applicationStatus === 'CLOSED') {
    blockingRisks += 1;
    reasons.push({ kind: 'risk', key: 'closed' });
  } else if (program.applicationStatus === 'UNKNOWN') {
    reasons.push({ kind: 'risk', key: 'statusUnknown' });
  } else if (program.deadline && !accepting) {
    blockingRisks += 1;
    reasons.push({ kind: 'risk', key: 'deadlinePassed' });
  } else if (program.deadline && program.deadline.getTime() - now.getTime() <= DEADLINE_SOON_DAYS * DAY_MS) {
    reasons.push({ kind: 'risk', key: 'deadlineSoon', params: { date: program.deadline.toISOString() } });
  }
  const stale =
    !program.statusVerifiedAt ||
    now.getTime() - program.statusVerifiedAt.getTime() > STALE_AFTER_DAYS * DAY_MS;
  if (stale && program.applicationStatus !== 'UNKNOWN') {
    reasons.push({ kind: 'risk', key: 'notRecentlyVerified' });
  }

  let fit: Fit;
  // A program built for a specific situation (students, pregnancy, disability) we haven't
  // confirmed is never more than "more information needed".
  if (hardUnknowns >= 2 || requiredUnknown) {
    fit = 'needs_info';
  } else if (
    // Most real sources don't state whether applications are open right now, so an unknown status
    // is shown as its own warning rather than ruling out a strong fit; a known closure does.
    hardUnknowns === 0 &&
    blockingRisks === 0 &&
    (targetMatches.length > 0 || requiredMet > 0 || overlap.length >= 2)
  ) {
    fit = 'strong';
  } else {
    fit = 'possible';
  }

  const score =
    overlap.length * 3 + targetMatches.length * 2 + requiredMet * 2 - hardUnknowns - blockingRisks * 2;

  return { programId: program.id, fit, score, reasons };
}

export function passesFilters(program: MatchableProgram & { genders: string[] }, filters: MatchFilters, now: Date) {
  if (filters.onlyOpen && !isAcceptingApplications(program, now)) return false;
  if (filters.womenOnly && !(program.genders.length === 1 && program.genders[0] === 'female')) {
    return false;
  }
  return true;
}

export function matchPrograms(
  programs: MatchableProgram[],
  profile: SupportProfile,
  filters: MatchFilters,
  now: Date,
): MatchOutcome[] {
  return programs
    .filter((program) => passesFilters(program, filters, now))
    .map((program) => matchProgram(program, profile, now))
    .filter((outcome): outcome is MatchOutcome => outcome !== null)
    .sort(
      (a, b) =>
        FIT_RANK[a.fit] - FIT_RANK[b.fit] || b.score - a.score || a.programId.localeCompare(b.programId),
    );
}
