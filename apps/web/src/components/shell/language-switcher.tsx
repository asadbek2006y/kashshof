'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

const SHORT = { uz: 'UZ', ru: 'RU', en: 'EN' } as const;
// Each language names itself, so someone who doesn't read the current one can still find theirs.
const NATIVE = { uz: 'O‘zbekcha', ru: 'Русский', en: 'English' } as const;

export function LanguageSwitcher() {
  const t = useTranslations('shell');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();
  const change = (l: AppLocale) =>
    startTransition(() =>
      // @ts-expect-error -- pathname and params always match the current route
      router.replace({ pathname, params }, { locale: l, scroll: false }),
    );

  return (
    <>
      {/* Small phones: a native select keeps the header within 320px without hiding Quick exit's label. */}
      <label className="sm:hidden">
        <span className="sr-only">{t('language')}</span>
        <select
          value={locale}
          onChange={(e) => change(e.target.value as AppLocale)}
          className="min-h-11 rounded-[var(--radius-sm)] border border-line bg-surface px-2 text-[14px] font-semibold text-ink"
          data-testid="language-select"
        >
          {routing.locales.map((l) => (
            <option key={l} value={l} lang={l}>
              {SHORT[l]}
            </option>
          ))}
        </select>
      </label>
      <div
        role="group"
        aria-label={t('language')}
        className="hidden items-center rounded-[var(--radius-sm)] border border-line bg-surface p-0.5 sm:flex"
        aria-busy={pending}
      >
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={l === locale}
            aria-label={NATIVE[l]}
            onClick={() => change(l)}
            className={`min-h-10 min-w-10 rounded-[6px] px-1.5 text-[13px] font-semibold tracking-[0.03em] transition-colors ${
              l === locale ? 'bg-primary text-white' : 'text-ink-2 hover:bg-sunken hover:text-ink'
            }`}
          >
            {SHORT[l]}
          </button>
        ))}
      </div>
    </>
  );
}
