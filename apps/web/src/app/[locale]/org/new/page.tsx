import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProgramForm } from '@/components/org/program-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('orgForm'))('title') };
}

export default async function NewProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <ProgramForm />;
}
