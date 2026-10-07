'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MatchResult } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { formatDay, listFormat } from '@/lib/dates';
import { nextStep, type NextStep } from '@/lib/next-step';
import { useVocab } from '@/lib/use-vocab';
import { ageRange } from '@/lib/vocab';

export function useNextStepText() {
  const t = useTranslations('nextStep');
  const vocab = useVocab();
  return (step: NextStep): string => {
    switch (step.key) {
      case 'deadlineSoon':
        return t('deadlineSoon', { date: formatDay(vocab.locale, new Date(step.date)) });
      case 'confirmGroup':
        return t('confirmGroup', { group: vocab.group(step.circumstance) });
      case 'confirmAge':
        return t('confirmAge', { range: ageRange(step.min, step.max) });
      case 'confirmRegion':
        return t('confirmRegion', { regions: listFormat(vocab.locale, step.regions.split(',').map(vocab.region)) });
      case 'documents':
        return t('documents', { count: step.count });
      case 'contact':
        return t('contact', { org: step.org });
      default:
        return t(step.key);
    }
  };
}

/** "What to do next" — one concrete action, derived from the matcher's reasons. */
export function NextStepLine({ match, className }: { match: Pick<MatchResult, 'reasons' | 'program'>; className?: string }) {
  const t = useTranslations('match');
  const text = useNextStepText();
  return (
    <div className={cn('rounded-[var(--radius-md)] bg-canvas px-4 py-3', className)} data-testid="next-step">
      <p className="label text-ink">{t('nextTitle')}</p>
      <p className="mt-1 flex gap-2 text-[15px] leading-snug text-ink">
        <ArrowRight className="mt-[2px] size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{text(nextStep(match))}</span>
      </p>
    </div>
  );
}
