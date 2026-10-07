'use client';

import { SendHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const MAX_MESSAGE_LENGTH = 2000;

/** The message box. Enter sends, Shift+Enter adds a line. */
export function ConversationComposer({
  onSend,
  disabled,
  label,
  placeholder,
  submitLabel,
  rows = 1,
  autoFocus = false,
  footer,
  className,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  submitLabel?: string;
  rows?: number;
  autoFocus?: boolean;
  footer?: ReactNode;
  className?: string;
}) {
  const t = useTranslations('ask');
  const id = useId();
  const [draft, setDraft] = useState('');
  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft('');
  };
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={id} className={rows > 1 ? 'mb-2 block text-[16px] font-semibold text-ink' : 'sr-only'}>
        {label}
      </label>
      <div
        className={cn(
          'rounded-[var(--radius-md)] border border-control bg-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          rows > 1 ? 'p-1' : 'flex items-end gap-2 p-1.5',
        )}
      >
        <textarea
          id={id}
          value={draft}
          rows={rows}
          maxLength={MAX_MESSAGE_LENGTH}
          autoFocus={autoFocus}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className={cn(
            'block w-full resize-none bg-transparent text-[17px] leading-relaxed text-ink outline-none placeholder:text-ink-3',
            rows > 1 ? 'px-3 pt-2.5 pb-1' : 'max-h-40 min-h-11 flex-1 px-2.5 py-2',
          )}
          data-testid="chat-input"
        />
        {rows > 1 ? (
          <div className="flex items-center justify-end gap-3 px-2 pb-2">
            <button type="submit" className="btn-primary" disabled={!draft.trim() || disabled} data-testid="chat-submit">
              {submitLabel ?? t('send')}
              <SendHorizontal className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="btn-primary min-h-11 px-4"
            disabled={!draft.trim() || disabled}
            data-testid="chat-submit"
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{submitLabel ?? t('send')}</span>
          </button>
        )}
      </div>
      {footer}
    </form>
  );
}
