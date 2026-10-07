import { emptyProfile, type SupportProfile } from '../domain/profile';
import { matchProgram, matchPrograms, type MatchableProgram } from './matching';

const NOW = new Date('2026-09-23T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

function program(overrides: Partial<MatchableProgram> = {}): MatchableProgram {
  return {
    id: 'p',
    supportTypes: ['education', 'financial'],
    genders: ['female'],
    ageMin: null,
    ageMax: null,
    regions: [],
    targetCircumstances: [],
    requiredCircumstances: [],
    incomeTested: false,
    applicationStatus: 'OPEN',
    deadline: null,
    statusVerifiedAt: new Date(NOW.getTime() - 2 * DAY),
    isDraft: false,
    ...overrides,
  };
}

function profile(overrides: Partial<SupportProfile> = {}): SupportProfile {
  return { ...emptyProfile(), ...overrides };
}

const keys = (reasons: { kind: string; key: string }[]) => reasons.map((r) => `${r.kind}:${r.key}`);

describe('matchProgram', () => {
  it('excludes programs that meet none of the needs', () => {
    expect(matchProgram(program(), profile({ needs: ['food'] }), NOW)).toBeNull();
  });

  it('excludes drafts', () => {
    expect(matchProgram(program({ isDraft: true }), profile({ needs: ['education'] }), NOW)).toBeNull();
  });

  it('excludes explicit gender, region and age mismatches', () => {
    const p = program({ regions: ['samarkand'], ageMin: 17, ageMax: 25 });
    expect(matchProgram(p, profile({ needs: ['education'], gender: 'male' }), NOW)).toBeNull();
    expect(matchProgram(p, profile({ needs: ['education'], region: 'bukhara' }), NOW)).toBeNull();
    expect(matchProgram(p, profile({ needs: ['education'], ageMin: 35, ageMax: 44 }), NOW)).toBeNull();
  });

  it('excludes when a required circumstance was explicitly ruled out', () => {
    const p = program({ requiredCircumstances: ['student'] });
    expect(matchProgram(p, profile({ needs: ['education'], notCircumstances: ['student'] }), NOW)).toBeNull();
  });

  it('is a strong match when everything is known and fits', () => {
    const p = program({ regions: ['tashkent_city'], ageMin: 17, ageMax: 25, requiredCircumstances: ['student'] });
    const outcome = matchProgram(
      p,
      profile({ needs: ['education'], region: 'tashkent_city', ageMin: 22, ageMax: 22, circumstances: ['student'] }),
      NOW,
    );
    expect(outcome?.fit).toBe('strong');
    expect(keys(outcome!.reasons)).toEqual(
      expect.arrayContaining(['yes:need', 'yes:forWomen', 'yes:inRegion', 'yes:ageFits', 'yes:hasCircumstance']),
    );
  });

  it('needs more information when two eligibility facts are unknown', () => {
    const p = program({ regions: ['tashkent_city'], ageMin: 17, ageMax: 25 });
    const outcome = matchProgram(p, profile({ needs: ['education'] }), NOW);
    expect(outcome?.fit).toBe('needs_info');
    expect(keys(outcome!.reasons)).toEqual(expect.arrayContaining(['unknown:regionCheck', 'unknown:ageLimit']));
  });

  it('flags an age band that only partly overlaps the program limits', () => {
    const outcome = matchProgram(
      program({ ageMin: 17, ageMax: 25 }),
      profile({ needs: ['education'], ageMin: 18, ageMax: 30 }),
      NOW,
    );
    expect(keys(outcome!.reasons)).toContain('risk:ageBorder');
    expect(outcome?.fit).toBe('possible');
  });

  it('needs more information while a required situation is unconfirmed', () => {
    const outcome = matchProgram(
      program({ requiredCircumstances: ['student'] }),
      profile({ needs: ['education'], circumstances: ['single_parent'] }),
      NOW,
    );
    expect(outcome?.fit).toBe('needs_info');
  });

  it('always flags income-tested programs as needing verification', () => {
    const outcome = matchProgram(program({ incomeTested: true }), profile({ needs: ['education'] }), NOW);
    expect(keys(outcome!.reasons)).toContain('unknown:income');
  });

  it('can call a program with unknown status a strong match, but still flags the status', () => {
    const outcome = matchProgram(
      program({ applicationStatus: 'UNKNOWN', statusVerifiedAt: null, targetCircumstances: ['student'] }),
      profile({ needs: ['education'], circumstances: ['student'] }),
      NOW,
    );
    expect(outcome?.fit).toBe('strong');
    expect(keys(outcome!.reasons)).toContain('risk:statusUnknown');
  });

  it('never calls a closed program a strong match', () => {
    const outcome = matchProgram(
      program({ applicationStatus: 'CLOSED', targetCircumstances: ['student'] }),
      profile({ needs: ['education', 'financial'], circumstances: ['student'] }),
      NOW,
    );
    expect(outcome?.fit).toBe('possible');
    expect(keys(outcome!.reasons)).toContain('risk:closed');
  });

  it('warns about deadlines within two weeks and passed deadlines', () => {
    const soon = matchProgram(program({ deadline: new Date(NOW.getTime() + 5 * DAY) }), profile(), NOW);
    expect(keys(soon!.reasons)).toContain('risk:deadlineSoon');
    const passed = matchProgram(program({ deadline: new Date(NOW.getTime() - DAY) }), profile(), NOW);
    expect(keys(passed!.reasons)).toContain('risk:deadlinePassed');
  });

  it('never hides stale or unknown status', () => {
    const stale = matchProgram(program({ statusVerifiedAt: new Date(NOW.getTime() - 90 * DAY) }), profile(), NOW);
    expect(keys(stale!.reasons)).toContain('risk:notRecentlyVerified');
    const unknown = matchProgram(program({ applicationStatus: 'UNKNOWN', statusVerifiedAt: null }), profile(), NOW);
    expect(keys(unknown!.reasons)).toContain('risk:statusUnknown');
  });
});

describe('matchPrograms', () => {
  it('orders strong before possible before needs_info and applies filters', () => {
    const programs = [
      program({ id: 'needs-info', regions: ['samarkand'], ageMin: 18, ageMax: 30 }),
      program({ id: 'strong', targetCircumstances: ['student'] }),
      program({ id: 'possible', applicationStatus: 'UNKNOWN' }),
      program({ id: 'men-too', genders: [] }),
    ];
    const p = profile({ needs: ['education'], circumstances: ['student'] });
    expect(matchPrograms(programs, p, {}, NOW).map((o) => o.programId)).toEqual([
      'strong',
      'men-too',
      'possible',
      'needs-info',
    ]);
    expect(matchPrograms(programs, p, { womenOnly: true, onlyOpen: true }, NOW).map((o) => o.programId)).toEqual([
      'strong',
      'needs-info',
    ]);
  });
});
