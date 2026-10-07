import { LifeBuoy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { BottomNav } from './bottom-nav';
import { Footer } from './footer';
import { HeaderNav } from './header-nav';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { ShellProviders } from './providers';
import { QuickExitButton } from './quick-exit';

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations('shell');
  const tNav = useTranslations('nav');
  return (
    <ShellProviders>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow-[var(--shadow-raised)]"
        >
          {t('skipToContent')}
        </a>
        <header className="sticky top-0 z-40 border-b border-line bg-canvas">
          <div className="page flex h-16 items-center gap-3 lg:gap-8">
            <Link href="/" aria-label={t('homeLabel')} className="shrink-0 rounded-[var(--radius-sm)]">
              <Logo />
            </Link>
            <HeaderNav />
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/safety"
                className="hidden min-h-11 items-center gap-1.5 px-1 text-[15px] font-semibold text-danger hover:underline hover:underline-offset-4 lg:inline-flex"
              >
                <LifeBuoy className="size-4" aria-hidden="true" />
                {tNav('urgentHelp')}
              </Link>
              <LanguageSwitcher />
              <QuickExitButton />
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 pb-12 outline-none">
          {children}
        </main>

        <Footer />
        {/* Room for the fixed bottom bar on phones. */}
        <div className="h-[calc(60px+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
        <BottomNav />
      </div>
    </ShellProviders>
  );
}
