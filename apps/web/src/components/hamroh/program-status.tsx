'use client';

import { CalendarClock, CircleCheck, CircleHelp, CircleX } from 'lucide-react';
import { useLocale, useNow, useTranslations } from 'next-intl';
import type { ProgramSummary } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { daysBetween, formatDay } from '@/lib/dates';

const STALE_DAYS = 60;

/** Application status, deadline and freshness. Never hides stale or unknown status. */
export function ProgramStatus({ program, className }: { program: ProgramSummary; className?: string }) {
  const t = useTranslations('status');
  const locale = useLocale();
  const now = useNow();

  const deadline = program.deadline ? new Date(program.deadline) : null;
  const passed = deadline !== null && deadline.getTime() < now.getTime();
  const status = program.applicationStatus === 'OPEN' && passed ? 'CLOSED' : program.applicationStatus;
  const verifiedAt = program.statusVerifiedAt ? new Date(program.statusVerifiedAt) : null;
  const stale = !verifiedAt || daysBetween(verifiedAt, now) > STALE_DAYS;
  const { icon: Icon, tone } = {
    OPEN: { icon: CircleCheck, tone: 'text-success' },
    CLOSED: { icon: CircleX, tone: 'text-danger' },
    UNKNOWN: { icon: CircleHelp, tone: 'text-warning' },
  }[status];

  return (
    <dl className={cn('space-y-1 text-[14px] leading-[1.45]', className)} data-testid="program-status">
      <div className={cn('flex items-center gap-1.5 font-semibold', tone)}>
        <dt className="sr-only">{t('applications')}</dt>
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <dd>{t(status)}</dd>
      </div>
      {deadline && (
        <div className="flex items-center gap-1.5 text-ink-2">
          <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
          <dt>{t('deadline')}</dt>
          <dd className="text-ink">{formatDay(locale, deadline, true)}</dd>
        </div>
      )}
      {(status === 'UNKNOWN' || stale) && status !== 'CLOSED' && (
        <div className="text-ink-2">
          <dt className="sr-only">{t('lastChecked')}</dt>
          <dd>{t('notRecentlyVerified')}</dd>
        </div>
      )}
    </dl>
  );
}
