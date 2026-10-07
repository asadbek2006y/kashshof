import type { ProgramSummary } from './api/client';

/**
 * How much a program's information has been checked. Three different things that must never be
 * shown as one "verified" badge:
 *  - a source exists (we collected it from a public page),
 *  - a person reviewed it against that source,
 *  - the person's eligibility is officially confirmed — which Kashshof never does.
 *
 * Kept apart from the components so manual review can later be stored as its own record.
 */
export type ReviewStatus =
  | 'sample' // invented prototype data
  | 'source_collected' // collected from a public source, not yet reviewed by a person
  | 'source_unavailable' // no source page on record
  | 'manually_reviewed' // a person confirmed it against the source
  | 'needs_rereview'; // was reviewed, but the review is old

export const REREVIEW_AFTER_DAYS = 180;
const DAY = 24 * 60 * 60 * 1000;

type Reviewable = Pick<ProgramSummary, 'origin' | 'sourceUrl' | 'organization'> & {
  /** When a person last reviewed this program. Not collected yet for any program. */
  reviewedAt?: string | null;
};

export function reviewStatus(program: Reviewable, now: Date = new Date()): ReviewStatus {
  if (program.origin === 'SAMPLE') return 'sample';
  if (program.reviewedAt) {
    const age = now.getTime() - new Date(program.reviewedAt).getTime();
    return age > REREVIEW_AFTER_DAYS * DAY ? 'needs_rereview' : 'manually_reviewed';
  }
  if (!program.sourceUrl) return 'source_unavailable';
  return 'source_collected';
}

/** Hostname for showing a source link compactly ("gov.uz"), or null when it isn't a URL. */
export function sourceHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
