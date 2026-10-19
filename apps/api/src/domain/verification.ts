/**
 * How far an organization's information has been checked. This is about the record, not the
 * organization: UNVERIFIED means "we have no source yet", never "untrustworthy".
 *
 *  VERIFIED   a person confirmed the details against an authoritative source
 *  PENDING    collected from a public source, waiting for a person to review it
 *  UNVERIFIED no source on record: only the name from the team's list
 */
export const VERIFICATION_STATUSES = ['VERIFIED', 'PENDING', 'UNVERIFIED'] as const;
export type Verification = (typeof VERIFICATION_STATUSES)[number];

/** A person's review of a record against its source — the only way to reach VERIFIED. */
export interface HumanReview {
  /** ISO date the person checked the details. */
  reviewedAt: string;
  /** What was checked and how (e.g. "Phone and services confirmed by calling the office"). */
  note: string;
}

export interface VerificationEvidence {
  sourceUrl: string | null;
  review?: HumanReview | null;
}

/**
 * Derives the status from the evidence on record, so it can't be set by hand without support.
 * A review without a source page doesn't count: the source is what the review was checked against.
 */
export function deriveVerification({ sourceUrl, review }: VerificationEvidence): Verification {
  if (!sourceUrl || !isHttpUrl(sourceUrl)) return 'UNVERIFIED';
  if (review && review.note.trim() && !Number.isNaN(Date.parse(review.reviewedAt))) return 'VERIFIED';
  return 'PENDING';
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** The site a source page belongs to, as a short name ("lex.uz"). Null for anything not a URL. */
export function sourceSiteName(url: string | null): string | null {
  if (!url || !isHttpUrl(url)) return null;
  return new URL(url).hostname.replace(/^www\./, '');
}
