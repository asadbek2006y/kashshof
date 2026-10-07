import { describe, expect, it } from 'vitest';
import type { MatchResult } from './api/client';
import { nextStep } from './next-step';

function match(reasons: MatchResult['reasons'], program: Partial<MatchResult['program']> = {}) {
  return {
    reasons,
    program: {
      requiredDocuments: [],
      sourceUrl: null,
      organization: { slug: 'org', name: 'Org', verification: 'UNVERIFIED' },
      ...program,
    } as MatchResult['program'],
  };
}

describe('nextStep', () => {
  it('puts a closed program first, whatever else is true', () => {
    const step = nextStep(match([{ kind: 'risk', key: 'closed' }, { kind: 'unknown', key: 'income' }], { requiredDocuments: ['id_document'] }));
    expect(step).toEqual({ key: 'closed' });
  });

  it('asks the person to confirm a required circumstance before preparing documents', () => {
    const step = nextStep(
      match([{ kind: 'unknown', key: 'confirmCircumstance', params: { circumstance: 'student' } }], { requiredDocuments: ['id_document'] }),
    );
    expect(step).toEqual({ key: 'confirmGroup', circumstance: 'student' });
  });

  it('turns an unknown region into a region check', () => {
    expect(nextStep(match([{ kind: 'unknown', key: 'regionCheck', params: { regions: 'fergana,andijan' } }]))).toEqual({
      key: 'confirmRegion',
      regions: 'fergana,andijan',
    });
  });

  it('flags an unverified application status', () => {
    expect(nextStep(match([{ kind: 'risk', key: 'statusUnknown' }]))).toEqual({ key: 'confirmOpen' });
  });

  it('falls back to documents, then the official page, then contacting the organization', () => {
    expect(nextStep(match([], { requiredDocuments: ['id_document', 'income_certificate'] }))).toEqual({ key: 'documents', count: 2 });
    expect(nextStep(match([], { sourceUrl: 'https://gov.uz/x' }))).toEqual({ key: 'officialPage' });
    expect(nextStep(match([]))).toEqual({ key: 'contact', org: 'Org' });
  });
});
