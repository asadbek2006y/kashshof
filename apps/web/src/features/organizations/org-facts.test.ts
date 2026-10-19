import { describe, expect, it } from 'vitest';
import type { ProgramSummary } from '@/lib/api/client';
import { orgFacts } from './org-facts';

const program = (over: Partial<ProgramSummary>): ProgramSummary => ({
  id: 'p',
  title: { uz: 'p', ru: 'p', en: 'p' },
  summary: { uz: '', ru: '', en: '' },
  supportTypes: [],
  genders: [],
  requiredDocuments: [],
  applicationStatus: 'UNKNOWN',
  deadline: null,
  statusVerifiedAt: null,
  isDraft: false,
  origin: 'RESEARCHED',
  sourceUrl: 'https://gov.uz',
  regions: [],
  targetCircumstances: [],
  organization: { slug: 'o', name: 'O', verification: 'PENDING', lastVerifiedAt: null },
  ...over,
});

describe('orgFacts', () => {
  it('says nothing about coverage, groups or documents when no programs are collected', () => {
    expect(orgFacts({ categories: ['food'], programs: [] })).toEqual({
      services: ['food'],
      coverage: { kind: 'unknown' },
      groups: [],
      documents: [],
    });
  });

  it('is nationwide when any program is, and otherwise lists the regions once', () => {
    expect(orgFacts({ categories: [], programs: [program({ regions: ['bukhara'] }), program({ regions: [] })] }).coverage).toEqual({
      kind: 'nationwide',
    });
    expect(
      orgFacts({ categories: [], programs: [program({ regions: ['bukhara'] }), program({ regions: ['bukhara', 'navoi'] })] }).coverage,
    ).toEqual({ kind: 'regions', regions: ['bukhara', 'navoi'] });
  });

  it('merges services from sections and programs, dropping values the UI cannot name', () => {
    const facts = orgFacts({
      categories: ['food', 'not_a_type'],
      programs: [program({ supportTypes: ['health', 'food'], requiredDocuments: ['id_document'], targetCircumstances: ['pregnant'] })],
    });
    expect(facts.services).toEqual(['food', 'health']);
    expect(facts.documents).toEqual(['id_document']);
    expect(facts.groups).toEqual(['pregnant']);
  });
});
