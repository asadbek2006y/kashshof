import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import ru from '../../messages/ru.json';
import uz from '../../messages/uz.json';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [k, v] of leaves(value, path)) out.set(k, v);
  }
  return out;
}

const english = leaves(en as Tree);

describe.each([
  ['uz', uz],
  ['ru', ru],
])('%s messages', (_locale, messages) => {
  const translated = leaves(messages as Tree);

  it('mirror every English key', () => {
    expect([...english.keys()].filter((k) => !translated.has(k))).toEqual([]);
    expect([...translated.keys()].filter((k) => !english.has(k))).toEqual([]);
  });

  it('have no empty values', () => {
    expect([...translated].filter(([, v]) => v.trim() === '').map(([k]) => k)).toEqual([]);
  });

  it('keep the same placeholders as English', () => {
    // Drop plural/select branch bodies ("one {# day ago}") so only argument names remain.
    const names = (s: string) => {
      let rest = s;
      for (let prev = ''; prev !== rest; ) {
        prev = rest;
        rest = rest.replace(/(=\d+|zero|one|two|few|many|other)\s*\{[^{}]*\}/g, '');
      }
      return [...new Set([...rest.matchAll(/\{\s*([A-Za-z_]\w*)\s*[,}]/g)].map((m) => m[1]))].sort();
    };
    const mismatched = [...english]
      .filter(([k, v]) => translated.has(k) && names(v).join() !== names(translated.get(k)!).join())
      .map(([k]) => k);
    expect(mismatched).toEqual([]);
  });
});

describe('English messages', () => {
  it('never promise eligibility or show percentages', () => {
    // Affirmative claims only — sentences explaining that Kashshof *doesn't* decide are fine.
    const claims = [/(^|[.!?]\s+)you (definitely )?qualify/i, /\byou are eligible\b/i, /\bguaranteed\b/i, /\d+\s?%/];
    const banned = [...english].filter(([, v]) => claims.some((re) => re.test(v))).map(([k]) => k);
    expect(banned).toEqual([]);
  });
});
