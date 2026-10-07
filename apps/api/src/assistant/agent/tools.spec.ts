import type { ProgramWithOrg } from '../../programs/programs.mapper';
import { initialState } from '../engine';
import { handleDetails, handleOfferChoices, handleSearch, handleUpdateProfile, type ToolContext } from './tools';

const NOW = new Date('2026-09-23T12:00:00Z');

function program(id: string, overrides: Partial<ProgramWithOrg> = {}): ProgramWithOrg {
  return {
    id,
    orgSlug: 'org',
    title: { en: `Title ${id}`, uz: `Nomi ${id}` },
    summary: { en: 'Summary' },
    howToApply: null,
    supportTypes: ['food'],
    genders: [],
    ageMin: null,
    ageMax: null,
    regions: [],
    targetCircumstances: [],
    requiredCircumstances: [],
    incomeTested: false,
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
    deadline: null,
    statusVerifiedAt: NOW,
    isDraft: false,
    origin: 'SAMPLE',
    sourceUrl: null,
    createdAt: NOW,
    updatedAt: NOW,
    org: {
      slug: 'org',
      name: 'Org',
      description: {},
      categories: [],
      website: null,
      phone: null,
      email: null,
      verification: 'UNVERIFIED',
      source: 'test',
      sourceUrl: null,
      researchedAt: null,
      lastVerifiedAt: null,
      sections: [],
      kind: 'NGO',
      createdAt: NOW,
      updatedAt: NOW,
    },
    ...overrides,
  } as ProgramWithOrg;
}

function context(programs: ProgramWithOrg[], locale = 'en'): ToolContext {
  return { state: initialState(), programs, now: NOW, locale };
}

describe('agent tools', () => {
  it('update_profile writes structured facts and reports what is still unknown', () => {
    const ctx = context([]);
    const result = handleUpdateProfile(ctx, { needs: ['food'], region: 'tashkent_city', childrenCount: 2, notCircumstances: ['student'] });
    expect(ctx.state.profile.needs).toEqual(['food']);
    expect(ctx.state.profile.circumstances).toContain('has_children');
    expect(ctx.state.profile.notCircumstances).toContain('student');
    expect(result.stillUnknown).toEqual(['age']);
  });

  it('search_programs uses the matching engine, applies filters and remembers positions', () => {
    const ctx = context([
      program('women', { genders: ['female'], supportTypes: ['food', 'financial'] }),
      program('anyone'),
      program('health', { supportTypes: ['health'] }),
    ]);
    handleUpdateProfile(ctx, { needs: ['food'] });
    const all = handleSearch(ctx, {});
    expect(all.results.map((r) => r.programId)).toEqual(['anyone', 'women']);
    expect(all.results[0]).toMatchObject({ position: 1, organization: 'Org' });

    const women = handleSearch(ctx, { womenOnly: true });
    expect(women.results.map((r) => r.programId)).toEqual(['women']);
    expect(ctx.state.lastResultIds).toEqual(['women']);
    expect(ctx.results?.map((r) => r.programId)).toEqual(['women']);
  });

  it('get_program_details only answers for known programs, in the requested language', () => {
    const ctx = context([program('p1', { requiredDocuments: ['id_document', 'family_composition'] })], 'uz');
    expect(handleDetails(ctx, { programId: 'p1' })).toMatchObject({
      title: 'Nomi p1',
      requiredDocuments: ['id_document', 'family_composition'],
    });
    expect(handleDetails(ctx, { programId: 'invented' })).toHaveProperty('error');
  });

  it('offer_choices turns a question into tappable answers', () => {
    const ctx = context([]);
    handleOfferChoices(ctx, { question: 'region' });
    expect(ctx.quickReplies?.slot).toBe('region');
    expect(ctx.state.pendingSlot).toBe('region');
    expect(ctx.state.asked).toContain('region');
  });
});
