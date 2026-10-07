import type { Locale } from './vocabulary';

/** Copy stored per language. Missing languages fall back in the web app, never here. */
export type LocalizedText = Partial<Record<Locale, string>>;
