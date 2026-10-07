import { describe, expect, it } from 'vitest';
import type { ProgramSummary } from '@/lib/api/client';
import { filterPrograms, type BrowseFilters } from './filter-programs';

const base: BrowseFilters = { q: '', type: null, region: null, org: null, group: null, onlyOpen: false, status: null };
const NOW = new Date('2026-10-01T00:00:00Z');

function program(id: string, overrides: Partial<ProgramSummary> = {}): ProgramSummary {
  return {
    id,
    title: { en: id },
    summary: { en: '' },
    supportTypes: ['financial'],
    genders: [],
    requiredDocuments: [],
    applicationStatus: 'OPEN',
    deadline: null,
    statusVerifiedAt: null,
    isDraft: false,
    origin: 'RESEARCHED',
    sourceUrl: 'https://gov.uz',
    regions: [],
    targetCircumstances: [],
    organization: { slug: 'org', name: 'Org', verification: 'UNVERIFIED' },
    ...overrides,
  } as ProgramSummary;
}

const PROGRAMS = [
  program('nationwide-cash'),
  program('fergana-legal', { supportTypes: ['legal'], regions: ['fergana'], targetCircumstances: ['single_parent'] }),
  program('closed', { applicationStatus: 'CLOSED', sourceUrl: null }),
];
const text = (p: ProgramSummary) => `${p.title.en} legal aid`;

describe('filterPrograms', () => {
  it('treats nationwide programs as available in every region', () => {
    expect(filterPrograms(PROGRAMS, { ...base, region: 'fergana' }, text, NOW).map((p) => p.id)).toEqual(['nationwide-cash', 'fergana-legal', 'closed']);
    expect(filterPrograms(PROGRAMS, { ...base, region: 'andijan' }, text, NOW).map((p) => p.id)).toEqual(['nationwide-cash', 'closed']);
  });

  it('filters by category, target group, open status and data status', () => {
    expect(filterPrograms(PROGRAMS, { ...base, type: 'legal' }, text, NOW).map((p) => p.id)).toEqual(['fergana-legal']);
    expect(filterPrograms(PROGRAMS, { ...base, group: 'single_parent' }, text, NOW).map((p) => p.id)).toEqual(['fergana-legal']);
    expect(filterPrograms(PROGRAMS, { ...base, onlyOpen: true }, text, NOW).map((p) => p.id)).not.toContain('closed');
    expect(filterPrograms(PROGRAMS, { ...base, status: 'source_unavailable' }, text, NOW).map((p) => p.id)).toEqual(['closed']);
  });

  it('matches every search word', () => {
    expect(filterPrograms(PROGRAMS, { ...base, q: 'fergana LEGAL' }, text, NOW).map((p) => p.id)).toEqual(['fergana-legal']);
  });
});
