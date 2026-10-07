import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('signIn'))('title') };
}

/** Accounts don't exist in the prototype — say so plainly instead of showing a fake form. */
export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('signIn');
  return (
    <div className="page">
      <div className="max-w-[40rem] pt-10 sm:pt-14">
        <h1 className="title-page">{t('title')}</h1>
        <p className="lead mt-3">{t('body')}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
          <Link href="/dashboard" className="btn-primary">
            {t('demo')}
          </Link>
          <Link href="/ask" className="action">
            {t('guest')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
