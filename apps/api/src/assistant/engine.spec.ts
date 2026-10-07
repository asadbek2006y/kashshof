import type { SupportProfile } from '../domain/profile';
import { matchPrograms, type MatchableProgram } from '../matching/matching';
import { runTurn, type EngineDeps, type TurnResult } from './engine';

const NOW = new Date('2026-09-23T12:00:00Z');

function program(id: string, overrides: Partial<MatchableProgram> = {}): MatchableProgram {
  return {
    id,
    supportTypes: ['financial'],
    genders: ['female'],
    ageMin: null,
    ageMax: null,
    regions: [],
    targetCircumstances: [],
    requiredCircumstances: [],
    incomeTested: false,
    applicationStatus: 'OPEN',
    deadline: null,
    statusVerifiedAt: NOW,
    isDraft: false,
    ...overrides,
  };
}

const PROGRAMS = [
  program('food-women', { supportTypes: ['food', 'financial'], targetCircumstances: ['single_parent'] }),
  program('food-all', { supportTypes: ['food'], genders: [] }),
  program('edu', { supportTypes: ['education'], requiredCircumstances: ['student'], ageMin: 17, ageMax: 25 }),
  program('safe', { supportTypes: ['safety', 'housing'], targetCircumstances: ['survivor'] }),
];
const DOCS: Record<string, string[]> = { 'food-women': ['id_document', 'family_composition'], 'food-all': ['id_document'] };

const deps: EngineDeps = {
  match: (profile: SupportProfile, filters) => matchPrograms(PROGRAMS, profile, filters, NOW),
  documentsFor: (id) => DOCS[id],
};

const keys = (result: TurnResult) => result.messages.map((m) => m.key);

describe('runTurn', () => {
  it('greets and asks for the need when opened empty', () => {
    const result = runTurn(undefined, {}, deps);
    expect(keys(result)).toEqual(['intake.greeting', 'ask.need']);
    expect(result.quickReplies?.slot).toBe('need');
    expect(result.quickReplies?.multi).toBe(true);
  });

  it('asks only for what is missing, then shows results', () => {
    const first = runTurn(undefined, { text: 'I am a single mother in Tashkent and need food help' }, deps);
    // Need, region and situation are known; only age is missing.
    expect(keys(first)).toEqual(['intake.ack', 'intake.preview', 'ask.age']);
    expect(first.state.pendingSlot).toBe('age');

    const second = runTurn(first.state, { choice: { slot: 'age', values: ['25_34'] } }, deps);
    expect(second.state.mode).toBe('results');
    expect(second.outcomes?.map((o) => o.programId)).toEqual(['food-women', 'food-all']);
    expect(second.quickReplies?.slot).toBe('next');
  });

  it('accepts a bare typed number as the age answer', () => {
    const first = runTurn(undefined, { text: 'single mother in Tashkent, need food' }, deps);
    const second = runTurn(first.state, { text: '29' }, deps);
    expect(second.state.profile.ageMin).toBe(29);
    expect(second.state.mode).toBe('results');
  });

  it('re-asks once when a typed answer does not fill the question, then moves on', () => {
    const first = runTurn(undefined, { text: 'need food' }, deps);
    expect(first.state.pendingSlot).toBe('region');
    const retry = runTurn(first.state, { text: 'hmm not sure' }, deps);
    expect(keys(retry)).toEqual(['ask.regionRetry']);
    const moved = runTurn(retry.state, { text: 'still not sure' }, deps);
    expect(moved.state.pendingSlot).toBe('age');
  });

  it('remembers result context for follow-ups', () => {
    let result = runTurn(undefined, { text: 'single mother in Tashkent, 30 years old, need food' }, deps);
    expect(result.outcomes?.map((o) => o.programId)).toEqual(['food-women', 'food-all']);

    result = runTurn(result.state, { text: 'only ones for women' }, deps);
    expect(result.outcomes?.map((o) => o.programId)).toEqual(['food-women']);
    expect(keys(result)[0]).toBe('refined.womenOnly');

    result = runTurn(result.state, { text: 'What documents does the first one require?' }, deps);
    expect(result.messages[0]).toMatchObject({
      key: 'docs.list',
      programId: 'food-women',
      list: ['id_document', 'family_composition'],
    });
  });

  it('switches to safety mode on a safety concern, at any point', () => {
    const first = runTurn(undefined, { text: 'need food' }, deps);
    const safety = runTurn(first.state, { text: 'My husband is threatening me and I need somewhere safe' }, deps);
    expect(safety.state.mode).toBe('safety');
    expect(safety.quickReplies?.slot).toBe('safety');
    expect(safety.quickReplies?.options.find((o) => o.value === 'emergency_info')?.href).toBe('/safety');

    const services = runTurn(safety.state, { choice: { slot: 'safety', values: ['find_services'] } }, deps);
    expect(services.state.mode).toBe('results');
    expect(services.outcomes?.[0]?.programId).toBe('safe');
  });

  it('treats unpicked situation options as answers', () => {
    const first = runTurn(undefined, { text: 'need help paying for university, Tashkent, 21 years old' }, deps);
    expect(first.state.pendingSlot).toBe('situation');
    const noStudent = runTurn(first.state, { choice: { slot: 'situation', values: ['employed'] } }, deps);
    expect(noStudent.state.profile.notCircumstances).toContain('student');
    // "Paying for university" is also a financial need, so only the student-only program drops out.
    expect(noStudent.outcomes?.map((o) => o.programId)).not.toContain('edu');
    expect(noStudent.state.mode).toBe('results');
  });

  it('restarts cleanly', () => {
    const results = runTurn(undefined, { text: 'single mother in Tashkent, 30 years old, need food' }, deps);
    const restarted = runTurn(results.state, { choice: { slot: 'next', values: ['restart'] } }, deps);
    expect(restarted.state.profile.needs).toEqual([]);
    expect(restarted.state.mode).toBe('chat');
    expect(keys(restarted)).toEqual(['restart.done', 'ask.need']);
  });
});
