import { LogOut, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProgramCard } from '@/components/hamroh/program-card';
import { NUMBER_SOURCES, URGENT_NUMBERS } from '@/features/safety/numbers';
import { serverApi } from '@/lib/api/server';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('safety'))('metaTitle') };
}

/** Urgent help. Deliberately static: no animation, nothing decorative, numbers first. */
export default async function SafetyPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('safety');
  const { data: services } = await serverApi.GET('/api/v1/programs', { params: { query: { supportType: 'safety' } } });

  return (
    <div className="page">
      <div className="max-w-[46rem] pt-8 sm:pt-12">
        <h1 className="title-page">{t('title')}</h1>
        <p className="lead mt-3">{t('lead')}</p>

        <section aria-labelledby="danger" className="mt-8 rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft p-5 sm:p-6">
          <h2 id="danger" className="text-[22px] font-semibold text-ink">
            {t('dangerTitle')}
          </h2>
          <p className="mt-1 text-[16px] text-ink">{t('dangerBody')}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2" data-testid="urgent-numbers">
            {URGENT_NUMBERS.map(({ number, key }) => (
              <li key={number}>
                <a
                  href={`tel:${number}`}
                  className="flex min-h-16 items-center gap-4 rounded-[var(--radius-md)] border border-danger/25 bg-surface px-4 py-3 hover:border-danger"
                >
                  <Phone className="size-5 shrink-0 text-danger" aria-hidden="true" />
                  <span className="w-16 text-[28px] leading-none font-bold tabular-nums text-ink">{number}</span>
                  <span className="text-[15.5px] leading-snug text-ink">{t(key)}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13.5px] text-ink-2">
            {t('numbersSource')}{' '}
            {NUMBER_SOURCES.map((s, i) => (
              <span key={s.href}>
                {i > 0 && ', '}
                <a className="underline underline-offset-2" href={s.href} rel="noreferrer noopener" referrerPolicy="no-referrer">
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </section>

        <section aria-labelledby="private" className="mt-10">
          <h2 id="private" className="title-section">
            {t('privateTitle')}
          </h2>
          <ul className="mt-4 space-y-3 text-[16px] text-ink">
            <li className="flex gap-3">
              <LogOut className="mt-1 size-4 shrink-0 text-ink-2" aria-hidden="true" />
              <span>{t('tipQuickExit')}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
              <span>{t('tipErased')}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
              <span>{t('tipHistory')}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
              <span>{t('tipPhone')}</span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="services" className="mt-10">
          <h2 id="services" className="title-section">
            {t('servicesTitle')}
          </h2>
          <p className="meta mt-1">{t('servicesLead')}</p>
          <div className="mt-4 grid gap-4">{services?.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
        </section>
      </div>
    </div>
  );
}
