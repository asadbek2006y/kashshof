import { loadResearch } from '../../prisma/research-data';
import { organizations as sampleOrganizations } from '../../prisma/seed-data';
import { deriveVerification, isHttpUrl } from '../domain/verification';
import { directory } from '../../prisma/directory-data';
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

  it('only verifies a record with a source page, a dated review and a note', () => {
    for (const o of orgs.filter((o) => o.review)) {
      expect(deriveVerification({ sourceUrl: o.sourceUrl, review: o.review })).toBe('VERIFIED');
    }
  });

  it('uses real web links for every website and source, and a date for every check', () => {
    for (const o of orgs) {
      for (const url of [o.website, o.sourceUrl]) if (url) expect(isHttpUrl(url)).toBe(true);
      if (o.checkedAt) expect(Number.isNaN(Date.parse(o.checkedAt))).toBe(false);
    }
  });

  it('has a description wherever it names a source, and one entry per directory organization', () => {
    for (const o of orgs.filter((o) => o.sourceUrl && !o.hidden)) expect(o.description).not.toBeNull();
    const slugs = orgs.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const listed = new Set(directory.map((d) => d.slug));
    for (const slug of slugs) expect(listed).toContain(slug);
  });
});
