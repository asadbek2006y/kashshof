import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SavedView } from '@/components/saved-view';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('saved'))('title') };
}

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <SavedView />;
}
