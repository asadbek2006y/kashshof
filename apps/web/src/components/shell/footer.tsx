import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const links = [
    { href: '/how-it-works', label: t('howItWorks') },
    { href: '/explore', label: t('browse') },
    { href: '/safety', label: t('urgentHelp') },
    { href: '/org', label: t('forOrganizations') },
    { href: '/dashboard', label: t('demoAccount') },
    { href: '/credits', label: t('credits') },
  ] as const;
  return (
    <footer className="border-t border-line bg-surface">
      <div className="page grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="max-w-[36rem]">
          <p className="text-[15px] font-semibold text-ink">{t('tagline')}</p>
          <p className="meta mt-1">{t('prototype')}</p>
          <p className="meta mt-1">{t('notOfficial')}</p>
        </div>
        <nav aria-label={t('label')}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 sm:flex-col sm:gap-y-0">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="action-quiet">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
