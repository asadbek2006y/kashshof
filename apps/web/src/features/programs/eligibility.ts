import type { ProgramDetail } from '@/lib/api/client';
import { listFormat, type LooseT, type Vocab } from '@/lib/vocab';

export function ageRangeText(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min}–${max}`;
  if (min !== null) return `${min}+`;
  return `≤ ${max}`;
}

/**
 * "Who it may be for": the program record's own conditions as plain sentences. Presentation
 * only — whether a person fits is decided by matching.ts.
 */
export function eligibilityLines(program: ProgramDetail, t: LooseT, vocab: Vocab, locale: string): string[] {
  const lines: string[] = [];
  if (program.genders.length === 1 && program.genders[0] === 'female') lines.push(t('program.eligibility.women'));
  if (program.ageMin !== null || program.ageMax !== null) {
    lines.push(t('program.eligibility.age', { range: ageRangeText(program.ageMin, program.ageMax) }));
  }
  lines.push(
    program.regions.length === 0
      ? t('program.eligibility.nationwide')
      : t('program.eligibility.regions', { regions: listFormat(locale, program.regions.map(vocab.region)) }),
  );
  for (const c of program.requiredCircumstances) lines.push(t('program.eligibility.required', { group: vocab.group(c) }));
  const targets = program.targetCircumstances.filter((c) => !program.requiredCircumstances.includes(c));
  if (targets.length > 0) {
    lines.push(t('program.eligibility.designedFor', { groups: listFormat(locale, targets.map(vocab.group)) }));
  }
  if (program.incomeTested) lines.push(t('program.eligibility.income'));
  return lines;
}
