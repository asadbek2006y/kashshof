import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PrepareApplication } from '@/features/apply/prepare-application';
import { eligibilityLines } from '@/features/programs/eligibility';
import { serverApi } from '@/lib/api/server';
import { makeVocab, type LooseT } from '@/lib/vocab';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('apply'))('eyebrow') };
}

export default async function ApplyPage({ params }: { params: Promise<{ locale: string; programId: string }> }) {
  const { locale, programId } = await params;
  setRequestLocale(locale);
  const { data: program } = await serverApi.GET('/api/v1/programs/{id}', { params: { path: { id: programId } } });
  if (!program) notFound();
  const t = (await getTranslations()) as unknown as LooseT;

  return (
    <div className="page pt-6 sm:pt-10">
      <PrepareApplication program={program} eligibility={eligibilityLines(program, t, makeVocab(t), locale)} />
    </div>
  );
}
