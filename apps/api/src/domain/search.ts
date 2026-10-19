/**
 * Search text normalization for Uzbek, Russian and English names. People type "o'zbekiston",
 * "oʻzbekiston", "ozbekiston" or "ўзбекистон" for the same word, so all of them must match
 * "O‘zbekiston": apostrophe variants are dropped, Uzbek Cyrillic is transliterated to Latin, and
 * case and accents are ignored.
 */
const APOSTROPHES = /[‘’ʻʼ'`´ʹ]/g;

// Uzbek Cyrillic → Latin (2023 orthography), lower case only — input is lower-cased first.
const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
  к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ў: 'o',
  ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    // Before NFKD, which would split ў/й/ё into a base letter and a mark.
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC[ch] ?? ch)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(APOSTROPHES, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** True when every word of the query appears in one of the fields (in any order). */
export function matchesSearch(query: string, fields: (string | null | undefined)[]): boolean {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields.filter(Boolean).map((f) => normalizeSearch(f!)).join(' ');
  return words.every((word) => haystack.includes(word));
}
