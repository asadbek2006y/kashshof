'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { wipeSensitiveState } from '@/features/chat/conversation-store';

// Somewhere ordinary to land.
export const EXIT_URL = 'https://www.google.com/search?q=ob+havo';
const DOUBLE_PRESS_MS = 600;

/**
 * Leave now: forget the conversation in this tab (memory and any Kashshof session storage), hide
 * the page at once so nothing stays on screen while the next site loads, and *replace* the
 * current history entry so Back doesn't return here. It can't erase earlier browser history —
 * the Safety page says so.
 */
export function quickExit(): void {
  wipeSensitiveState();
  document.title = 'Google';
  document.body.style.visibility = 'hidden';
  window.location.replace(EXIT_URL);
}

/** Esc pressed twice quickly triggers Quick exit, from anywhere — including inside dialogs. */
export function useQuickExitShortcut() {
  useEffect(() => {
    let last = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const now = Date.now();
      if (now - last < DOUBLE_PRESS_MS) quickExit();
      last = now;
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, []);
}

export function QuickExitButton() {
  const t = useTranslations('shell');
  useQuickExitShortcut();
  return (
    <button
      type="button"
      onClick={quickExit}
      aria-describedby="quick-exit-hint"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] bg-ink px-3.5 text-[14px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-black"
      data-testid="quick-exit"
    >
      <LogOut className="size-4" aria-hidden="true" />
      {t('quickExit')}
      <span id="quick-exit-hint" className="sr-only">
        {t('quickExitHint')}
      </span>
    </button>
  );
}
