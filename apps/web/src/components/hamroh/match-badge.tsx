import { CircleCheck, CircleDot, CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MatchResult } from '@/lib/api/client';
import { cn } from '@/lib/cn';

export type Fit = MatchResult['fit'];

export const FIT_STYLE: Record<Fit, { icon: typeof CircleCheck; text: string; box: string }> = {
  strong: { icon: CircleCheck, text: 'text-fit-strong', box: 'bg-fit-strong-soft border-fit-strong/25' },
  possible: { icon: CircleDot, text: 'text-fit-possible', box: 'bg-fit-possible-soft border-fit-possible/25' },
  needs_info: { icon: CircleHelp, text: 'text-fit-needs', box: 'bg-fit-needs-soft border-fit-needs/30' },
};

/** The matcher's own label — icon + words + colour, never a percentage. */
export function MatchBadge({ fit, className }: { fit: Fit; className?: string }) {
  const t = useTranslations('fit');
  const { icon: Icon, text, box } = FIT_STYLE[fit];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[14px] leading-tight font-semibold', text, box, className)}
      data-testid="match-badge"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {t(fit)}
    </span>
  );
}
