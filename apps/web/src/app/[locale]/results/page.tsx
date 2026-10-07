import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResultsView } from '@/features/matching/results-view';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('results'))('metaTitle') };
}

export default async function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <ResultsView />;
}
