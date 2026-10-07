import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrgDashboard } from '@/components/org/org-dashboard';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('org'))('title') };
}

export default async function OrgPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  setRequestLocale((await params).locale);
  const { created } = await searchParams;
  return <OrgDashboard createdId={created} />;
}
