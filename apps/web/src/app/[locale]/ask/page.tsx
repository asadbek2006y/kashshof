import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Chat } from '@/features/chat/chat';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ask');
  return { title: t('metaTitle') };
}

export default async function AskPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <Chat />;
}
