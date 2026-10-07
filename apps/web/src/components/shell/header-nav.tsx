'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { HEADER_NAV, isActive } from './nav-items';

export function HeaderNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')} className="hidden h-full lg:block">
      <ul className="flex h-full items-stretch gap-7">
        {HEADER_NAV.map(({ href, key }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center border-b-2 pt-0.5 text-[15px] font-medium transition-colors ${
                  active ? 'border-primary text-ink' : 'border-transparent text-ink-2 hover:text-ink'
                }`}
              >
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
