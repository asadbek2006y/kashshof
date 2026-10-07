/**
 * Minimal multilingual text matching for the scripted assistant. Uzbek (Latin), Russian and
 * English are handled with the same rules: lowercase, unify the many apostrophe variants
 * Uzbek writers use (o‘, oʻ, o`, o'), and split into tokens.
 *
 * A keyword with a space is a phrase matched against the normalized text; a keyword without a
 * space is a stem matched as a token prefix ("pregnan" → "pregnant", "беремен" → "беременна").
 * A keyword starting with "=" must equal a whole token ("=fire" matches "fire" but not "fired").
 */

const APOSTROPHES = /[ʻʼ‘’`´]/g;

export interface NormalizedText {
  /** Lowercased, apostrophes unified, every non-letter/digit/apostrophe run collapsed to one space. */
  text: string;
  tokens: string[];
}

export function normalize(raw: string): NormalizedText {
  const text = ` ${raw
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(APOSTROPHES, "'")
    .replace(/[^\p{L}\p{N}']+/gu, ' ')
    .trim()} `;
  const tokens = text
    .split(' ')
    .map((token) => token.replace(/^'+|'+$/g, ''))
    .filter(Boolean);
  return { text, tokens };
}

export function matchesKeyword(input: NormalizedText, keyword: string): boolean {
  const k = keyword.toLowerCase().replace(/ё/g, 'е');
  if (k.startsWith('=')) return input.tokens.includes(k.slice(1));
  if (k.includes(' ')) return input.text.includes(` ${k}`);
  return input.tokens.some((token) => token.startsWith(k));
}

export function matchesAny(input: NormalizedText, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => matchesKeyword(input, keyword));
}
