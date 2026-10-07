import { BadgeCheck, FileQuestion, FileSearch, FileWarning, FlaskConical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { ReviewStatus } from '@/lib/review-status';

const STYLE: Record<ReviewStatus, { icon: typeof BadgeCheck; tone: string }> = {
  source_collected: { icon: FileSearch, tone: 'text-ink-2' },
  source_unavailable: { icon: FileQuestion, tone: 'text-warning' },
  manually_reviewed: { icon: BadgeCheck, tone: 'text-success' },
  needs_rereview: { icon: FileWarning, tone: 'text-warning' },
  sample: { icon: FlaskConical, tone: 'text-warning' },
};

/**
 * How much the information has been checked. Deliberately not a badge that looks official:
 * "source collected" is not "reviewed", and neither means anyone's eligibility is confirmed.
 */
export function VerificationStatus({ status, detailed = false, className }: { status: ReviewStatus; detailed?: boolean; className?: string }) {
  const t = useTranslations('review');
  const { icon: Icon, tone } = STYLE[status];
  return (
    <div className={cn('flex gap-2', className)} data-testid="verification-status" data-status={status}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', tone)} aria-hidden="true" />
      <div className="min-w-0 text-[14px] leading-snug">
        <p className={cn('font-medium', tone)}>{t(`label.${status}`)}</p>
        {detailed && <p className="mt-1 text-ink-2">{t(`body.${status}`)}</p>}
      </div>
    </div>
  );
}
