import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

/** What happens to what you tell Kashshof — shown before you tell it anything. */
export function PrivacyNotice({ className, compact = false }: { className?: string; compact?: boolean }) {
  const t = useTranslations('privacy');
  return (
    <section aria-labelledby="privacy-title" className={cn('rounded-[var(--radius-md)] border border-line bg-surface px-4 py-4 sm:px-5', className)} data-testid="privacy-notice">
      <h2 id="privacy-title" className="flex items-start gap-2 text-[16px] leading-snug font-semibold text-ink">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        {t('title')}
      </h2>
      {!compact && (
        <ul className="mt-2.5 space-y-1.5 pl-6 text-[15px] leading-snug text-ink-2">
          <li className="list-disc marker:text-ink-3">{t('memory')}</li>
          <li className="list-disc marker:text-ink-3">{t('neverStored')}</li>
          <li className="list-disc marker:text-ink-3">{t('organizations')}</li>
        </ul>
      )}
    </section>
  );
}
