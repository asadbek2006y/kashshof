import type { MatchReason } from './api/client';
import { listFormat, formatDay } from './dates';


/** A translator loose enough to take runtime-built keys (vocabulary values come from the API). */
export type LooseT = (key: string, values?: Record<string, string | number | Date>) => string;
export type HasT = (key: string) => boolean;

export const SUPPORT_TYPES = [
  'financial', 'education', 'food', 'health', 'maternity', 'children_family', 'employment',
  'business', 'housing', 'legal', 'safety', 'disability', 'mental_wellbeing', 'emergency',
] as const;

export const REGIONS = [
  'tashkent_city', 'tashkent_region', 'andijan', 'bukhara', 'fergana', 'jizzakh', 'kashkadarya',
  'khorezm', 'namangan', 'navoi', 'samarkand', 'surkhandarya', 'syrdarya', 'karakalpakstan',
] as const;

export const DOCUMENTS = [
  'id_document', 'income_certificate', 'enrollment_certificate', 'birth_certificate', 'medical_report',
  'disability_certificate', 'residence_certificate', 'business_plan', 'family_composition',
] as const;

export function makeVocab(t: LooseT) {
  return {
    need: (v: string) => t(`need.${v}`),
    region: (v: string) => t(`region.${v}`),
    document: (v: string) => t(`document.${v}`),
    group: (v: string) => t(`group.${v}`),
    situation: (v: string) => t(`situation.${v}`),
  };
}
export type Vocab = ReturnType<typeof makeVocab>;

export { listFormat };

export function ageRange(min: string | undefined, max: string | undefined): string {
  const lo = Number(min ?? 0);
  const hi = Number(max ?? 120);
  if (hi >= 120) return `${lo}+`;
  if (lo <= 0) return `≤ ${hi}`;
  return `${lo}–${hi}`;
}

/** Human sentence for a match reason, in the viewer's language. */
export function reasonText(
  reason: MatchReason,
  t: LooseT,
  vocab: Vocab,
  locale: string,
): string {
  const p = reason.params ?? {};
  const values: Record<string, string> = {};
  if (p.supportType) values.what = vocab.need(p.supportType);
  if (p.region) values.region = vocab.region(p.region);
  if (p.regions) values.regions = listFormat(locale, p.regions.split(',').map(vocab.region));
  if (p.circumstance) values.group = vocab.group(p.circumstance);
  if (p.min !== undefined || p.max !== undefined) values.range = ageRange(p.min, p.max);
  if (p.date) values.date = formatDay(locale, new Date(p.date));
  return t(`reasons.${reason.key}`, values);
}
