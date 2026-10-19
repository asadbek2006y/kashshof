import { normalizeSearch, matchesSearch } from './search';
import { deriveVerification, sourceSiteName } from './verification';

describe('deriveVerification', () => {
  const review = { reviewedAt: '2026-10-01', note: 'Phone and services confirmed with the office' };

  it('keeps a record without a source UNVERIFIED, even with a review', () => {
    expect(deriveVerification({ sourceUrl: null })).toBe('UNVERIFIED');
    expect(deriveVerification({ sourceUrl: null, review })).toBe('UNVERIFIED');
    expect(deriveVerification({ sourceUrl: 'not a url', review })).toBe('UNVERIFIED');
    expect(deriveVerification({ sourceUrl: 'javascript:alert(1)', review })).toBe('UNVERIFIED');
  });

  it('makes a sourced record PENDING until a person reviews it', () => {
    expect(deriveVerification({ sourceUrl: 'https://gov.uz/oz' })).toBe('PENDING');
    expect(deriveVerification({ sourceUrl: 'https://gov.uz/oz', review: null })).toBe('PENDING');
  });

  it('needs a dated review with a note to verify', () => {
    expect(deriveVerification({ sourceUrl: 'https://gov.uz/oz', review })).toBe('VERIFIED');
    expect(deriveVerification({ sourceUrl: 'https://gov.uz/oz', review: { ...review, note: '  ' } })).toBe('PENDING');
    expect(deriveVerification({ sourceUrl: 'https://gov.uz/oz', review: { ...review, reviewedAt: 'soon' } })).toBe('PENDING');
  });
});

describe('sourceSiteName', () => {
  it('names the site and rejects non-URLs', () => {
    expect(sourceSiteName('https://www.gazeta.uz/oz/2026/03/04/x/')).toBe('gazeta.uz');
    expect(sourceSiteName('ftp://example.org')).toBeNull();
    expect(sourceSiteName(null)).toBeNull();
  });
});

describe('search normalization', () => {
  it('treats apostrophe variants and missing apostrophes alike', () => {
    for (const q of ["o'zbekiston", 'oʻzbekiston', 'o`zbekiston', 'ozbekiston', 'O‘ZBEKISTON']) {
      expect(normalizeSearch(q)).toBe('ozbekiston');
    }
  });

  it('transliterates Uzbek Cyrillic, including ў, қ, ғ and ҳ', () => {
    expect(normalizeSearch('Ўзбекистон')).toBe('ozbekiston');
    expect(normalizeSearch('Саховат ва кўмак')).toBe('saxovat va komak');
    expect(normalizeSearch('ғамхўрлик')).toBe('gamxorlik');
    expect(normalizeSearch('Қизил ярим ой')).toBe('qizil yarim oy');
  });

  it('matches every word of the query in any field, in any order', () => {
    const fields = ['“Saxovat va ko‘mak” jamg‘armasi', null, 'Oziq-ovqat vaucheri'];
    expect(matchesSearch('komak saxovat', fields)).toBe(true);
    expect(matchesSearch("ko'mak", fields)).toBe(true);
    expect(matchesSearch('кўмак', fields)).toBe(true);
    expect(matchesSearch('oziq', fields)).toBe(true);
    expect(matchesSearch('unicef', fields)).toBe(false);
    expect(matchesSearch('   ', fields)).toBe(true);
  });
});
