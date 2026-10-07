import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/ui/page-header';
import { MEDIA_CREDITS } from '@/features/home/media-credits';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('credits'))('title') };
}

/** Attribution for every photo and video, as their Creative Commons licences require. */
export default async function CreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('credits');
  const tMedia = await getTranslations('media');
  return (
    <div className="page">
      <PageHeader title={t('title')} lead={t('lead')} />
      <ul className="grid max-w-[46rem] gap-3" data-testid="media-credits">
        {MEDIA_CREDITS.map((c) => (
          <li key={c.key} className="card p-5">
            <p className="text-[16px] font-semibold text-ink">{tMedia(`${c.key}.caption`)}</p>
            <p className="meta mt-1">{t(`used.${c.key}`)}</p>
            <p className="mt-2 text-[15px] text-ink">
              {t('by', { author: c.author })} ·{' '}
              <a href={c.licenseUrl} className="underline underline-offset-2" rel="noreferrer noopener" target="_blank">
                {c.license}
              </a>{' '}
              ·{' '}
              <a href={c.sourceUrl} className="underline underline-offset-2" rel="noreferrer noopener" target="_blank">
                {t('source')}
              </a>
            </p>
          </li>
        ))}
      </ul>
      <p className="meta mt-6 max-w-[46rem]">{t('note')}</p>
    </div>
  );
}
