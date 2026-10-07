import type { Schemas } from './api/client';

type LocalizedText = Schemas['LocalizedTextDto'];

const FALLBACK = ['uz', 'ru', 'en'] as const;

/** Pick the viewer's language, falling back to whatever the organization wrote. */
export function pick(text: LocalizedText | null | undefined, locale: string): string {
  if (!text) return '';
  const value = text[locale as keyof LocalizedText];
  if (value) return value;
  for (const l of FALLBACK) if (text[l]) return text[l]!;
  return '';
}
