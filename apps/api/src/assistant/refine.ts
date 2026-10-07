import { matchesAny, normalize } from './text';

/**
 * Follow-ups a person types once results are on screen: narrowing ("only for women", "only
 * open ones"), asking about a result by position ("what documents does the first one need?"),
 * or starting over. Returns null when the text isn't a refinement, so the caller can treat it
 * as new information instead.
 */
export type Refinement =
  | { type: 'womenOnly' }
  | { type: 'onlyOpen' }
  | { type: 'documents'; index: number }
  | { type: 'restart' };

const ONLY = ['only', 'just', 'faqat', 'только', 'лишь'];
const WOMEN = ['women', 'woman', 'female', 'ayol', 'xotin qiz', 'женщин'];
const OPEN = ['open', 'accepting', 'currently', 'ochiq', 'qabul', 'открыт', 'принима', 'сейчас'];
const DOCUMENTS = ['document', 'papers', 'hujjat', 'документ', 'справк'];
const RESTART = ['start over', 'start again', 'restart', 'qaytadan', 'boshidan', 'заново', 'сначала'];

const ORDINALS: [number, string[]][] = [
  [0, ['first', '1st', '=1', 'birinchi', 'перв']],
  [1, ['second', '2nd', '=2', 'ikkinchi', 'втор']],
  [2, ['third', '3rd', '=3', 'uchinchi', 'трет']],
];

export function parseRefinement(raw: string): Refinement | null {
  const input = normalize(raw);
  if (matchesAny(input, RESTART)) return { type: 'restart' };
  if (matchesAny(input, DOCUMENTS)) {
    const index = ORDINALS.find(([, words]) => matchesAny(input, words))?.[0] ?? 0;
    return { type: 'documents', index };
  }
  const only = matchesAny(input, ONLY);
  if (only && matchesAny(input, WOMEN)) return { type: 'womenOnly' };
  if ((only || matchesAny(input, ['currently accepting', 'still open', 'hozir'])) && matchesAny(input, OPEN)) {
    return { type: 'onlyOpen' };
  }
  return null;
}
