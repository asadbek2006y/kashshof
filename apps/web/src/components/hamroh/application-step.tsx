import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Numbered step list for the application preparation flow. Steps are buttons; the current one is marked. */
export function ApplicationSteps({
  steps,
  current,
  onSelect,
  label,
}: {
  steps: string[];
  current: number;
  onSelect: (index: number) => void;
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="application-steps">
        {steps.map((title, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={title}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex min-h-14 w-full items-center gap-2.5 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-[14px] leading-tight font-medium transition-colors',
                  state === 'current' && 'border-primary bg-primary-soft text-primary',
                  state === 'done' && 'border-line bg-surface text-ink',
                  state === 'todo' && 'border-line bg-surface text-ink-2 hover:border-control',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                    state === 'current' && 'bg-primary text-white',
                    state === 'done' && 'bg-success text-white',
                    state === 'todo' && 'bg-sunken text-ink-2',
                  )}
                  aria-hidden="true"
                >
                  {state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                {title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
