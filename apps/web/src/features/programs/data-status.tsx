import { CircleCheck, CircleMinus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { VerificationStatus } from '@/components/hamroh/verification-status';
import { ReportButton } from '@/components/program/report-button';
import { formatDay } from '@/lib/dates';
import type { ReviewStatus } from '@/lib/review-status';

/**
 * Three separate questions, answered separately:
 * does a source exist, has a person reviewed it, and is anyone's eligibility officially confirmed.
 */
export function DataStatus({ status, researchedAt, hasSource }: { status: ReviewStatus; researchedAt: string | null; hasSource: boolean }) {
  const t = useTranslations('dataStatus');
  const locale = useLocale();
  const reviewed = status === 'manually_reviewed';
  const rows = [
    { label: t('sourceExists'), ok: hasSource, value: hasSource ? (researchedAt ? t('collectedOn', { date: formatDay(locale, new Date(researchedAt), true) }) : t('yes')) : t('no') },
    { label: t('reviewed'), ok: reviewed, value: reviewed ? t('yes') : t('notYet') },
    { label: t('eligibility'), ok: false, value: t('eligibilityValue') },
  ];
  return (
    <div className="space-y-4" data-testid="data-status">
      <VerificationStatus status={status} detailed />
      <dl className="divide-y divide-line rounded-[var(--radius-md)] border border-line bg-surface">
        {rows.map(({ label, ok, value }) => (
          <div key={label} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 px-4 py-3">
            <dt className="text-[15px] font-medium text-ink">{label}</dt>
            <dd className="flex items-center gap-1.5 text-[15px] text-ink-2">
              {ok ? <CircleCheck className="size-4 text-success" aria-hidden="true" /> : <CircleMinus className="size-4 text-ink-3" aria-hidden="true" />}
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="meta">{t('confirmWithOrg')}</p>
      <ReportButton />
    </div>
  );
}
