import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

const STAGES = ['situation', 'details', 'support', 'next'] as const;
export type Stage = 0 | 1 | 2 | 3;

/** Where the person is in the conversation, in words — never a percentage. */
export function ConversationProgress({ current, className }: { current: Stage; className?: string }) {
  const t = useTranslations('progress');
  return (
    <nav aria-label={t('label')} className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)} data-testid="conversation-progress">
      <ol className="flex min-w-max items-center gap-1.5 text-[13px] sm:text-[14px]">
        {STAGES.map((stage, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={stage} className="flex items-center gap-1.5" aria-current={state === 'current' ? 'step' : undefined}>
              {i > 0 && <span className="h-px w-4 bg-line-strong sm:w-6" aria-hidden="true" />}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 font-medium',
                  state === 'current' && 'bg-primary-soft text-primary',
                  state === 'done' && 'text-ink',
                  state === 'todo' && 'text-ink-3',
                )}
              >
                {state === 'done' && <Check className="size-3.5 text-success" aria-hidden="true" />}
                {t(stage)}
                {state === 'done' && <span className="sr-only">{t('done')}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
