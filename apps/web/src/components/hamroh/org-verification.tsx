import { BadgeCheck, CircleDashed, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { formatDay } from '@/lib/dates';
import { ORG_VERIFICATIONS, type OrgVerification } from '@/lib/review-status';

/**
 * Deliberately calm: only VERIFIED gets colour. PENDING and UNVERIFIED say how far *we* have
 * checked the record — never that the organization is doubtful — so they stay neutral grey.
 */
const STYLE: Record<OrgVerification, { icon: typeof BadgeCheck; tone: string }> = {
  VERIFIED: { icon: BadgeCheck, tone: 'text-success' },
  PENDING: { icon: Clock, tone: 'text-ink-2' },
  UNVERIFIED: { icon: CircleDashed, tone: 'text-ink-3' },
};

/** An organization's verification status as the API reports it, with its date when known. */
export function OrgVerification({
  status,
  lastVerifiedAt = null,
  researchedAt = null,
  detailed = false,
  className,
}: {
  status: OrgVerification;
  lastVerifiedAt?: string | null;
  researchedAt?: string | null;
  detailed?: boolean;
  className?: string;
}) {
  const t = useTranslations('verification');
  const locale = useLocale();
  const { icon: Icon, tone } = STYLE[status];
  const date =
    status === 'VERIFIED' && lastVerifiedAt
      ? t('verifiedOn', { date: formatDay(locale, new Date(lastVerifiedAt), true) })
      : status === 'PENDING' && researchedAt
        ? t('collectedOn', { date: formatDay(locale, new Date(researchedAt), true) })
        : null;
  return (
    <div className={cn('flex min-w-0 gap-1.5 text-[14px] leading-snug', className)} data-testid="org-verification" data-status={status}>
      <Icon className={cn('mt-px size-4 shrink-0', tone)} aria-hidden="true" />
      <div className="min-w-0">
        <p className={cn('font-medium', tone)}>{t(`label.${status}`)}</p>
        {date && <p className="mt-0.5 text-ink-2">{date}</p>}
        {detailed && <p className="mt-1 text-ink-2">{t(`body.${status}`)}</p>}
      </div>
    </div>
  );
}

/** What each status means, and what none of them means (an eligibility decision). */
export function VerificationLegend({ className }: { className?: string }) {
  const t = useTranslations('verification');
  return (
    <details className={cn('group rounded-[var(--radius-md)] border border-line bg-surface', className)} data-testid="verification-legend">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        {t('legendTitle')}
        <span aria-hidden="true" className="text-ink-2 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-3 border-t border-line px-4 py-4">
        {ORG_VERIFICATIONS.map((status) => (
          <OrgVerification key={status} status={status} detailed />
        ))}
        <p className="meta border-t border-line pt-3 text-[14px]">{t('notEligibility')}</p>
      </div>
    </details>
  );
}
