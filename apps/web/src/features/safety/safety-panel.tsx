import { LifeBuoy, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { URGENT_NUMBERS } from './numbers';

/**
 * Shown the moment the deterministic safety rules fire (never decided by a model). It replaces
 * the normal conversation chrome: urgent numbers first, no animation, nothing celebratory.
 */
export function SafetyPanel({ className, headingLevel = 2 }: { className?: string; headingLevel?: 2 | 3 }) {
  const t = useTranslations('safetyPanel');
  const tNumbers = useTranslations('safety');
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section
      aria-labelledby="safety-panel-title"
      className={cn('rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft p-5 sm:p-6', className)}
      data-testid="safety-panel"
    >
      <H id="safety-panel-title" className="flex items-center gap-2 text-[20px] leading-snug font-semibold text-ink">
        <LifeBuoy className="size-5 shrink-0 text-danger" aria-hidden="true" />
        {t('title')}
      </H>
      <p className="mt-2 text-[16px] text-ink">{t('body')}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {URGENT_NUMBERS.slice(0, 3).map(({ number, key }) => (
          <li key={number}>
            <a
              href={`tel:${number}`}
              className="flex min-h-14 items-center gap-3 rounded-[var(--radius-sm)] border border-danger/25 bg-surface px-4 py-2 hover:border-danger"
            >
              <Phone className="size-4 shrink-0 text-danger" aria-hidden="true" />
              <span className="text-[22px] leading-none font-bold tabular-nums text-ink">{number}</span>
              <span className="text-[14.5px] leading-snug text-ink-2">{tNumbers(key)}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/safety" className="action text-danger" data-testid="safety-page-link">
          {t('allHelp')}
        </Link>
      </div>
      <p className="meta mt-3">{t('quickExit')}</p>
    </section>
  );
}
