import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PrivacyToggles } from '@/components/privacy-toggles';
import { DemoPersonaNotice, Notice } from '@/components/ui/notice';
import { PageHeader } from '@/components/ui/page-header';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import { makeVocab, type LooseT } from '@/lib/vocab';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('profile'))('title') };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2 border-t border-line pt-6 pb-8 sm:grid-cols-[12rem_1fr] sm:gap-8">
      <h2 className="text-[21px] leading-snug font-medium">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-0">
      <dt className="text-[15px] text-ink-2">{label}</dt>
      <dd className="text-right text-[15px] text-ink">{value}</dd>
    </div>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');
  const vocab = makeVocab((await getTranslations()) as unknown as LooseT);
  const { data: persona } = await serverApi.GET('/api/v1/demo/persona');
  if (!persona) return <div className="page pt-10"><Notice tone="warn">{t('error')}</Notice></div>;
  const { profile } = persona;
  const has = (c: string) => profile.circumstances.includes(c as (typeof profile.circumstances)[number]);
  const yes = t('yes');
  const no = t('no');

  return (
    <div className="page">
      <div className="max-w-[46rem]">
        <PageHeader
          title={t('title')}
          lead={t('lead')}
          actions={
            <Link href="/dashboard" className="action">
              {t('dashboard')} →
            </Link>
          }
        />
        <div className="mb-8">
          <DemoPersonaNotice />
        </div>

        <Section title={t('personal')}>
          <dl>
            <Row label={t('name')} value={persona.name} />
            <Row label={t('age')} value={profile.ageMin ?? '—'} />
            <Row label={t('region')} value={profile.region ? vocab.region(profile.region) : '—'} />
          </dl>
        </Section>

        <Section title={t('situation')}>
          <dl>
            <Row label={vocab.situation('student')} value={has('student') ? yes : no} />
            <Row label={vocab.situation('employed')} value={has('employed') ? yes : no} />
            <Row label={t('children')} value={profile.childrenCount ?? 0} />
          </dl>
        </Section>

        <Section title={t('lookingFor')}>
          <ul className="space-y-1 text-[15px] text-ink">
            {profile.needs.map((n) => (
              <li key={n}>{vocab.need(n)}</li>
            ))}
          </ul>
        </Section>

        <Section title={t('documents')}>
          <dl>
            {persona.documents.map((d) => (
              <Row
                key={d.type}
                label={vocab.document(d.type)}
                value={<span className={d.status === 'ready' ? 'text-success' : 'text-ink-3'}>{d.status === 'ready' ? t('uploaded') : t('notUploaded')}</span>}
              />
            ))}
          </dl>
        </Section>

        <Section title={t('privacyTitle')}>
          <PrivacyToggles />
        </Section>
      </div>
    </div>
  );
}
