import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApplicationCard } from '@/components/application-card';
import { DemoPersonaNotice, Notice } from '@/components/ui/notice';
import { PageHeader } from '@/components/ui/page-header';
import { serverApi } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('applications'))('title') };
}

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('applications');
  const { data: persona } = await serverApi.GET('/api/v1/demo/persona');

  return (
    <div className="page">
      <div className="max-w-[44rem]">
        <PageHeader title={t('title')} lead={t('lead')} />
        <DemoPersonaNotice />
        {!persona && <div className="mt-6"><Notice tone="warn">{t('error')}</Notice></div>}
        <div className="mt-6 border-t border-line">
          {persona?.applications.map((app) => <ApplicationCard key={app.id} app={app} locale={locale} />)}
        </div>
      </div>
    </div>
  );
}
