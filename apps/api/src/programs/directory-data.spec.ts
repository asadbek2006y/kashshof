import { directory, SECTION_SUPPORT_TYPES } from '../../prisma/directory-data';
import { organizations } from '../../prisma/seed-data';
import { DIRECTORY_SECTIONS, SUPPORT_TYPES } from '../domain/vocabulary';

describe('organization directory data', () => {
  it('accounts for every entry of the 100-name source list exactly once', () => {
    const numbers = directory.flatMap((d) => d.listNumbers).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
    expect(directory).toHaveLength(69);
  });

  it('has unique slugs and only known sections', () => {
    expect(new Set(directory.map((d) => d.slug)).size).toBe(directory.length);
    for (const entry of directory) {
      expect(entry.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      for (const section of entry.sections) expect(DIRECTORY_SECTIONS).toContain(section);
    }
    for (const types of Object.values(SECTION_SUPPORT_TYPES)) {
      for (const t of types) expect(SUPPORT_TYPES).toContain(t);
    }
  });

  it('merges into every sample organization instead of duplicating it', () => {
    const slugs = new Set(directory.map((d) => d.slug));
    for (const org of organizations) expect(slugs).toContain(org.slug);
  });
});
