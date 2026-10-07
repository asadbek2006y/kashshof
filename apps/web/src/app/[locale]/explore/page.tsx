import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { ProgramBrowser } from '@/features/programs/program-browser';
import { serverApi } from '@/lib/api/server';
import { SUPPORT_TYPES } from '@/lib/vocab';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('explore'))('title') };
}

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  setRequestLocale((await params).locale);
  const { type } = await searchParams;
  const initialType = (SUPPORT_TYPES as readonly string[]).includes(type ?? '') ? type! : null;
  const t = await getTranslations('explore');
  const { data: programs, error } = await serverApi.GET('/api/v1/programs');

  return (
    <div className="page">
      <PageHeader title={t('title')} lead={t('lead')} />
      {error || !programs ? (
        <ErrorState title={t('errorTitle')} body={t('errorBody')} />
      ) : (
        <ProgramBrowser programs={programs} initialType={initialType} />
      )}
    </div>
  );
}
