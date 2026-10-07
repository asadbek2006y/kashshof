import { loadResearch } from '../../prisma/research-data';
import { organizations as sampleOrganizations } from '../../prisma/seed-data';
import { CIRCUMSTANCES, DOCUMENTS, GENDERS, REGIONS, SUPPORT_TYPES } from '../domain/vocabulary';

const research = loadResearch();

describe('researched organization data', () => {
  it('exists', () => {
    expect(research).not.toBeNull();
  });

  const orgs = research?.organizations ?? [];
  const programs = orgs.flatMap((o) => o.programs.map((p) => ({ ...p, orgSlug: o.slug })));

  it('gives every researched program a source page, a unique id and a status', () => {
    expect(new Set(programs.map((p) => p.id)).size).toBe(programs.length);
    for (const p of programs) {
      expect(p.sourceUrl).toMatch(/^https?:\/\//);
      expect(['OPEN', 'CLOSED', 'UNKNOWN']).toContain(p.applicationStatus);
    }
  });

  it('only uses known vocabulary, so matching understands every program', () => {
    for (const p of programs) {
      for (const v of p.supportTypes) expect(SUPPORT_TYPES).toContain(v);
      for (const v of p.genders) expect(GENDERS).toContain(v);
      for (const v of p.regions) expect(REGIONS).toContain(v);
      for (const v of [...p.targetCircumstances, ...p.requiredCircumstances]) expect(CIRCUMSTANCES).toContain(v);
      for (const v of p.requiredDocuments) expect(DOCUMENTS).toContain(v);
      expect(p.supportTypes.length).toBeGreaterThan(0);
    }
  });

  it('has every text in all three languages', () => {
    const texts = [
      ...orgs.flatMap((o) => (o.description ? [o.description] : [])),
      ...programs.flatMap((p) => [p.title, p.summary, ...(p.howToApply ? [p.howToApply] : [])]),
    ];
    for (const t of texts) {
      expect(t.en.trim()).not.toBe('');
      expect(t.uz.trim()).not.toBe('');
      expect(t.ru.trim()).not.toBe('');
    }
  });

  it('hides organizations it could not confirm, and gives them no programs', () => {
    for (const o of orgs.filter((o) => o.hidden)) {
      expect(o.programs).toHaveLength(0);
      expect(o.reviewNote).toBeTruthy();
    }
  });

  it('covers every organization that had invented sample programs, so none of those remain', () => {
    const researched = new Set(orgs.map((o) => o.slug));
    for (const org of sampleOrganizations) expect(researched).toContain(org.slug);
  });
});
