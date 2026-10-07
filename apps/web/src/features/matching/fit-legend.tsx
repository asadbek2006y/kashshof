import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MatchBadge } from '@/components/hamroh/match-badge';

const FITS = ['strong', 'possible', 'needs_info'] as const;

/** What the three labels mean. Native <details>: works with keyboard and without JavaScript. */
export function FitLegend() {
  const t = useTranslations('results');
  const tHelp = useTranslations('fitHelp');
  return (
    <details className="group rounded-[var(--radius-md)] border border-line bg-surface" data-testid="fit-legend">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {t('legendTitle')}
        <ChevronDown className="size-5 shrink-0 text-ink-2 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="grid gap-3 border-t border-line px-4 py-4">
        {FITS.map((fit) => (
          <div key={fit} className="grid gap-1.5 sm:grid-cols-[15rem_1fr] sm:items-start sm:gap-4">
            <dt>
              <MatchBadge fit={fit} />
            </dt>
            <dd className="text-[15px] leading-snug text-ink-2">{tHelp(fit)}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
