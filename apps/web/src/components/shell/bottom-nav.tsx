'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { BOTTOM_NAV, isActive } from './nav-items';

/** Mobile navigation: five items reachable with one thumb, labels always visible. */
export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  return (
    <nav
      aria-label={t('mobileLabel')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      data-testid="bottom-nav"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV.map(({ href, key, icon: Icon }) => {
          const active = isActive(pathname, href);
          const urgent = href === '/safety';
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-0.5 text-center text-[12px] leading-tight ${
                  active ? 'font-semibold text-primary' : urgent ? 'font-medium text-danger' : 'text-ink-2'
                }`}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                <span className="max-w-full tracking-[-0.01em] [overflow-wrap:anywhere] max-[359px]:text-[11px]">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
