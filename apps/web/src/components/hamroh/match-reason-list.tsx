'use client';

import { CircleAlert, CircleCheck, CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MatchReason } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { useVocab } from '@/lib/use-vocab';

const GROUPS = [
  { kind: 'yes', icon: CircleCheck, tone: 'text-success', titleKey: 'whyFits', mark: '✓' },
  { kind: 'unknown', icon: CircleHelp, tone: 'text-warning', titleKey: 'toCheck', mark: '?' },
  { kind: 'risk', icon: CircleAlert, tone: 'text-danger', titleKey: 'mightNot', mark: '!' },
] as const;

/**
 * "Why this appeared": exactly the matcher's reasons, grouped as ✓ fits, ? needs checking and
 * ! may prevent eligibility. The icons carry the meaning for sighted people; the group headings
 * carry it for screen readers.
 */
export function MatchReasonList({
  reasons,
  only,
  className,
}: {
  reasons: MatchReason[];
  only?: ReadonlyArray<MatchReason['kind']>;
  className?: string;
}) {
  const t = useTranslations('match');
  const vocab = useVocab();
  const groups = GROUPS.filter((g) => !only || only.includes(g.kind));
  return (
    <div className={cn('grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] sm:gap-x-8', className)} data-testid="reason-list">
      {groups.map(({ kind, icon: Icon, tone, titleKey, mark }) => {
        const items = reasons.filter((r) => r.kind === kind);
        if (items.length === 0) return null;
        return (
          <div key={kind} data-kind={kind}>
            <h4 className="label mb-2 flex items-center gap-1.5 text-ink">
              <span className={cn('font-bold', tone)} aria-hidden="true">
                {mark}
              </span>
              {t(titleKey)}
            </h4>
            <ul className="space-y-2">
              {items.map((reason, i) => (
                <li key={`${reason.key}-${i}`} className="flex gap-2.5 text-[15px] leading-snug text-ink">
                  <Icon className={cn('mt-[1px] size-[18px] shrink-0', tone)} aria-hidden="true" />
                  <span>{vocab.reason(reason)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
