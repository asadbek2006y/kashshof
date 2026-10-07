import type { MatchResult } from './api/client';

/**
 * The single most useful thing to do next for a match, derived only from the matcher's own
 * reasons and the program record — never from the language model. Blockers come first, then
 * what the person still has to confirm, then preparation, then where to apply.
 */
export type NextStep =
  | { key: 'closed' }
  | { key: 'deadlineSoon'; date: string }
  | { key: 'confirmGroup'; circumstance: string }
  | { key: 'confirmAge'; min?: string; max?: string }
  | { key: 'confirmRegion'; regions: string }
  | { key: 'confirmIncome' }
  | { key: 'confirmOpen' }
  | { key: 'documents'; count: number }
  | { key: 'officialPage' }
  | { key: 'contact'; org: string };

export function nextStep(match: Pick<MatchResult, 'reasons' | 'program'>): NextStep {
  const has = (key: string) => match.reasons.find((r) => r.key === key);

  if (has('closed') || has('deadlinePassed')) return { key: 'closed' };
  const soon = has('deadlineSoon');
  if (soon?.params?.date) return { key: 'deadlineSoon', date: soon.params.date };

  const group = has('confirmCircumstance');
  if (group?.params?.circumstance) return { key: 'confirmGroup', circumstance: group.params.circumstance };
  const age = has('ageLimit') ?? has('ageBorder');
  if (age) return { key: 'confirmAge', min: age.params?.min, max: age.params?.max };
  const region = has('regionCheck');
  if (region?.params?.regions) return { key: 'confirmRegion', regions: region.params.regions };
  if (has('income')) return { key: 'confirmIncome' };
  if (has('statusUnknown') || has('notRecentlyVerified')) return { key: 'confirmOpen' };

  if (match.program.requiredDocuments.length > 0) {
    return { key: 'documents', count: match.program.requiredDocuments.length };
  }
  if (match.program.sourceUrl) return { key: 'officialPage' };
  return { key: 'contact', org: match.program.organization.name };
}
