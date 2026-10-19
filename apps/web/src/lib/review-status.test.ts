import { describe, expect, it } from 'vitest';
import { reviewStatus, sourceHost } from './review-status';

const org = { slug: 'o', name: 'O', verification: 'PENDING' as const, lastVerifiedAt: null };
const NOW = new Date('2026-10-01T00:00:00Z');

describe('reviewStatus', () => {
  it('never calls collected data reviewed', () => {
    expect(reviewStatus({ origin: 'RESEARCHED', sourceUrl: 'https://gov.uz', organization: org }, NOW)).toBe('source_collected');
  });

  it('marks programs without a source page as unavailable rather than inventing one', () => {
    expect(reviewStatus({ origin: 'RESEARCHED', sourceUrl: null, organization: org }, NOW)).toBe('source_unavailable');
  });

  it('distinguishes sample data', () => {
    expect(reviewStatus({ origin: 'SAMPLE', sourceUrl: null, organization: org }, NOW)).toBe('sample');
  });

  it('asks for a re-review when a manual review is old', () => {
    const base = { origin: 'RESEARCHED' as const, sourceUrl: 'https://gov.uz', organization: org };
    expect(reviewStatus({ ...base, reviewedAt: '2026-09-01T00:00:00Z' }, NOW)).toBe('manually_reviewed');
    expect(reviewStatus({ ...base, reviewedAt: '2025-09-01T00:00:00Z' }, NOW)).toBe('needs_rereview');
  });
});

describe('reviewStatus from the organization status', () => {
  const base = { origin: 'RESEARCHED' as const, sourceUrl: 'https://gov.uz' };

  it('counts a program as reviewed only when its organization was verified by a person', () => {
    const verified = { ...org, verification: 'VERIFIED' as const, lastVerifiedAt: '2026-09-20T00:00:00Z' };
    expect(reviewStatus({ ...base, organization: verified }, NOW)).toBe('manually_reviewed');
    expect(reviewStatus({ ...base, organization: { ...verified, lastVerifiedAt: '2025-01-01T00:00:00Z' } }, NOW)).toBe('needs_rereview');
    expect(reviewStatus({ ...base, organization: { ...org, verification: 'PENDING' } }, NOW)).toBe('source_collected');
    expect(reviewStatus({ ...base, organization: { ...org, verification: 'UNVERIFIED' } }, NOW)).toBe('source_collected');
  });

  it('never calls a program without a source reviewed, even under a verified organization', () => {
    const verified = { ...org, verification: 'VERIFIED' as const, lastVerifiedAt: '2026-09-20T00:00:00Z' };
    expect(reviewStatus({ ...base, sourceUrl: null, organization: verified }, NOW)).toBe('source_unavailable');
  });
});

describe('sourceHost', () => {
  it('shortens URLs and rejects non-URLs', () => {
    expect(sourceHost('https://www.my.gov.uz/oz/service/1')).toBe('my.gov.uz');
    expect(sourceHost('not a url')).toBeNull();
    expect(sourceHost(null)).toBeNull();
  });
});
