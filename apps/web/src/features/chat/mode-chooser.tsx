'use client';

import { Bot, ListChecks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import type { AssistantMode } from './conversation-store';

/**
 * Choose how Kashshof listens. Private guided is the default; AI assistance is opt-in and says
 * exactly what Gemini does and doesn't do. Neither mode changes which programs can match.
 */
export function ModeChooser({
  value,
  onChange,
  aiAvailable,
}: {
  value: AssistantMode;
  onChange: (mode: AssistantMode) => void;
  aiAvailable: boolean | undefined;
}) {
  const t = useTranslations('modes');
  if (aiAvailable === undefined) {
    return (
      <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  const options = [
    { mode: 'private' as const, icon: ListChecks, disabled: false },
    { mode: 'ai' as const, icon: Bot, disabled: !aiAvailable },
  ];
  return (
    <fieldset data-testid="mode-chooser">
      <legend className="text-[16px] font-semibold text-ink">{t('legend')}</legend>
      <p className="meta mt-1">{t('neitherDecides')}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map(({ mode, icon: Icon, disabled }) => {
          const checked = value === mode;
          return (
            <label
              key={mode}
              className={cn(
                'relative flex cursor-pointer gap-3 rounded-[var(--radius-md)] border bg-surface p-4 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                checked ? 'border-primary bg-primary-soft/40 ring-1 ring-primary' : 'border-control hover:border-ink',
                disabled && 'cursor-not-allowed opacity-60 hover:border-control',
              )}
            >
              <input
                type="radio"
                name="assistant-mode"
                value={mode}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(mode)}
                className="sr-only"
                data-testid={`mode-${mode}`}
              />
              <span
                className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2', checked ? 'border-primary' : 'border-control')}
                aria-hidden="true"
              >
                {checked && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[16px] font-semibold text-ink">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {t(`${mode}.name`)}
                </span>
                <span className="mt-1 block text-[14.5px] leading-snug text-ink-2">{t(`${mode}.description`)}</span>
                {disabled && <span className="mt-1.5 block text-[14px] font-medium text-warning">{t('aiUnavailable')}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
