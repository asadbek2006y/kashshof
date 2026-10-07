import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <div className="page max-w-[44rem] pt-14">
      <h1 className="title-page">{t('title')}</h1>
      <p className="lead mt-3">{t('body')}</p>
      <Link href="/" className="action mt-4">
        {t('home')} →
      </Link>
    </div>
  );
}
