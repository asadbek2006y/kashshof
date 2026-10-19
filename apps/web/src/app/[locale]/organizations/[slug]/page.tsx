import { ExternalLink, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProgramCard } from '@/components/hamroh/program-card';
import { OrgVerification } from '@/components/hamroh/org-verification';
import { ContactBlock } from '@/components/program/contact-block';
import { ReportButton } from '@/components/program/report-button';
import { TrustBlock } from '@/components/program/trust-block';
import { Notice, PrototypeDataNotice } from '@/components/ui/notice';
import { orgFacts } from '@/features/organizations/org-facts';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import { pick } from '@/lib/localized';
import { listFormat, makeVocab, type LooseT } from '@/lib/vocab';

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
  const tKind = await getTranslations('orgKind');
  const tSection = await getTranslations('section');
  const tDir = await getTranslations('directory');
  const vocab = makeVocab((await getTranslations()) as unknown as LooseT);
  const description = pick(org.description, locale);
  const facts = orgFacts(org);
  const hasContact = Boolean(org.phone || org.email || org.address);
  // Incomplete when nobody has verified it, or a part people need is missing.
  const incomplete = org.verification !== 'VERIFIED' || !description || !(org.website || hasContact) || org.programs.length === 0;

  const where =
    facts.coverage.kind === 'nationwide'
      ? t('nationwide')
      : facts.coverage.kind === 'regions'
        ? listFormat(locale, facts.coverage.regions.map(vocab.region))
        : null;

  return (
    <div className="page">
      <nav aria-label={t('breadcrumb')} className="meta pt-8 sm:pt-10">
        <Link href="/organizations" className="inline-flex min-h-11 items-center hover:text-ink hover:underline hover:underline-offset-4">
          ← {tDir('title')}
        </Link>
      </nav>

      <header className="max-w-[46rem] pt-3 pb-8">
        <p className="kicker">{tKind(org.kind)}</p>
        <h1 className="title-page mt-2">{org.name}</h1>
        {org.sections.length > 0 && <p className="meta mt-2">{org.sections.map((s) => tSection(s as 'health')).join(' · ')}</p>}
        <OrgVerification
          status={org.verification}
          lastVerifiedAt={org.lastVerifiedAt}
          researchedAt={org.researchedAt}
          className="mt-4"
        />

        <div className="mt-6 flex flex-wrap gap-3" data-testid="org-actions">
          {org.website && (
            <a href={org.website} className="btn-primary w-full sm:w-auto" rel="noreferrer noopener" target="_blank" data-testid="org-website">
              <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              {t('officialWebsite')}
              <span className="sr-only">{t('opensNewTab')}</span>
            </a>
          )}
          {hasContact && (
            <a href="#contact" className={`${org.website ? 'btn-secondary' : 'btn-primary'} w-full sm:w-auto`} data-testid="org-contact">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {t('contact')}
            </a>
          )}
          <ReportButton orgSlug={org.slug} variant="button" />
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
        <div className="max-w-[46rem] min-w-0">
          {incomplete && (
            <Notice title={t('incompleteTitle')} className="mb-8">
              {t('incompleteBody')}
            </Notice>
          )}

          <section aria-labelledby="about" className="rule pt-7">
            <h2 id="about" className="title-section">
              {t('about')}
            </h2>
            <p className={`mt-3 ${description ? 'text-[17px] text-ink' : 'text-ink-2'}`}>{description || t('noDescription')}</p>
          </section>

          <section aria-labelledby="services" className="rule mt-10 pt-7" data-testid="org-services">
            <h2 id="services" className="title-section">
              {t('services')}
            </h2>
            {facts.services.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {facts.services.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-surface px-3 py-1 text-[14px] text-ink">
                    {vocab.need(s)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta mt-3">{t('noServices')}</p>
            )}
            <p className="meta mt-4 flex items-start gap-1.5">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
              {where ?? t('areaUnknown')}
            </p>
          </section>

          <section aria-labelledby="who" className="rule mt-10 pt-7" data-testid="org-eligibility">
            <h2 id="who" className="title-section">
              {t('whoCanApply')}
            </h2>
            {facts.groups.length > 0 ? (
              <>
                <p className="meta mt-3">{t('groupsLead')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
                  {facts.groups.map((g) => (
                    <li key={g}>{vocab.group(g)}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="meta mt-3">{org.programs.length > 0 ? t('groupsOpen') : t('eligibilityUnknown')}</p>
            )}
            <p className="meta mt-3 text-[14px]">{t('eligibilityNote')}</p>
          </section>

          <section aria-labelledby="documents" className="rule mt-10 pt-7" data-testid="org-documents">
            <h2 id="documents" className="title-section">
              {t('documents')}
            </h2>
            {facts.documents.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ink">
                {facts.documents.map((d) => (
                  <li key={d}>{vocab.document(d)}</li>
                ))}
              </ul>
            ) : (
              <p className="meta mt-3">{t('documentsUnknown')}</p>
            )}
          </section>

          <section aria-labelledby="programs" className="rule mt-10 pt-7">
            <h2 id="programs" className="title-section">
              {t('programs')}
            </h2>
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
            {org.programs.some((p) => p.origin === 'SAMPLE') && (
              <div className="mt-6">
                <PrototypeDataNotice />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div className="border-t border-line pt-6">
            <ContactBlock website={org.website} phone={org.phone} email={org.email} address={org.address} />
          </div>
          <div className="border-t border-line pt-6">
            <TrustBlock org={org} />
          </div>
        </aside>
      </div>
    </div>
  );
}
