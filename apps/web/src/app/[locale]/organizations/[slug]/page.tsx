import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactBlock } from '@/components/program/contact-block';
import { ProgramCard } from '@/components/hamroh/program-card';
import { TrustBlock } from '@/components/program/trust-block';
import { Notice, PrototypeDataNotice, ResearchedDataNotice } from '@/components/ui/notice';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import { pick } from '@/lib/localized';

async function load(slug: string) {
  const { data } = await serverApi.GET('/api/v1/organizations/{slug}', { params: { path: { slug } } });
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const org = await load((await params).slug);
  return { title: org?.name };
}

export default async function OrganizationPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const org = await load(slug);
  if (!org) notFound();
  const t = await getTranslations('organization');
  const tTrust = await getTranslations('trust');
  const tKind = await getTranslations('orgKind');
  const tSection = await getTranslations('section');
  const tDir = await getTranslations('directory');
  const description = pick(org.description, locale);

  return (
    <div className="page">
      <nav aria-label={t('breadcrumb')} className="meta pt-8 sm:pt-10">
        <Link href="/organizations" className="hover:text-ink hover:underline hover:underline-offset-4">
          {tDir('title')}
        </Link>
      </nav>

      <header className="grid gap-4 pt-6 pb-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
        <div className="max-w-[46rem]">
          <p className="kicker">{tKind(org.kind)}</p>
          <h1 className="title-page mt-3">{org.name}</h1>
          <p className="meta mt-3">{org.sections.map((s) => tSection(s as 'health')).join(' · ')}</p>
          {org.website && (
            <a href={org.website} className="action" rel="noreferrer">
              {t('officialWebsite')} ↗
            </a>
          )}
        </div>
        <p className={`text-[15px] font-medium lg:pt-8 ${org.verification === 'VERIFIED' ? 'text-success' : 'text-warning'}`}>
          {org.verification === 'VERIFIED' ? tTrust('verified') : tTrust('unverified')}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
        <div className="max-w-[46rem] min-w-0">
          <section aria-labelledby="about" className="rule pt-7">
            <h2 id="about" className="title-section">{t('about')}</h2>
            <p className={`mt-3 ${description ? 'text-[17px] text-ink' : 'text-ink-2'}`}>{description || t('noDescription')}</p>
          </section>

          <section aria-labelledby="programs" className="rule mt-10 pt-7">
            <h2 id="programs" className="title-section">{t('programs')}</h2>
            {org.programs.length === 0 ? (
              <div className="mt-4">
                <Notice>{t('noPrograms')}</Notice>
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {org.programs.map((program) => (
                  <ProgramCard key={program.id} program={program} showOrg={false} />
                ))}
              </div>
            )}
            {org.programs.length > 0 && (
              <div className="mt-6">
                {org.programs.some((p) => p.origin === 'SAMPLE') ? <PrototypeDataNotice /> : <ResearchedDataNotice />}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div className="border-t border-line pt-6">
            <ContactBlock website={org.website} phone={org.phone} email={org.email} />
          </div>
          <div className="border-t border-line pt-6">
            <TrustBlock
              verification={org.verification}
              source={org.source}
              lastVerifiedAt={org.lastVerifiedAt}
              sourceUrl={org.sourceUrl}
              researchedAt={org.researchedAt}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
