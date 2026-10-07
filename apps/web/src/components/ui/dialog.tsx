'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

/**
 * Accessible dialog (Radix: focus trap, Esc to close, focus returns to the trigger).
 * `sheet` slides up from the bottom on phones and is a side panel from `sm` up.
 */
export function DialogContent({
  title,
  description,
  variant = 'center',
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  variant?: 'center' | 'sheet';
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations('common');
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-[fade-in_150ms_ease-out]" />
      <RadixDialog.Content
        className={cn(
          'fixed z-50 flex max-h-[90dvh] flex-col overflow-hidden bg-surface shadow-[var(--shadow-raised)] outline-none',
          variant === 'center'
            ? 'top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)]'
            : 'inset-x-0 bottom-0 rounded-t-[var(--radius-lg)] pb-[env(safe-area-inset-bottom)] sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[26rem] sm:rounded-none sm:rounded-l-[var(--radius-lg)]',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <RadixDialog.Title className="text-[18px] leading-snug font-semibold text-ink">{title}</RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="meta mt-1">{description}</RadixDialog.Description>
            ) : (
              <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-2 hover:bg-sunken hover:text-ink">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{t('close')}</span>
          </RadixDialog.Close>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
