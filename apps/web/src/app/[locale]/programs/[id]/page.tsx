import { ClipboardList, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DocumentChecklist } from '@/components/hamroh/document-checklist';
import { ProgramSource } from '@/components/hamroh/program-source';
import { ProgramStatus } from '@/components/hamroh/program-status';
import { SaveButton } from '@/components/hamroh/save-button';
import { VerificationStatus } from '@/components/hamroh/verification-status';
import { PrototypeDataNotice } from '@/components/ui/notice';
import { DataStatus } from '@/features/programs/data-status';
import { ageRangeText, eligibilityLines } from '@/features/programs/eligibility';
import { MatchEvidence } from '@/features/programs/match-evidence';
import { ProgramSection } from '@/features/programs/program-section';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import { pick } from '@/lib/localized';
import { reviewStatus } from '@/lib/review-status';
import { toSaved } from '@/lib/saved';
import { listFormat, makeVocab, type LooseT } from '@/lib/vocab';

async function load(id: string) {
  const { data } = await serverApi.GET('/api/v1/programs/{id}', { params: { path: { id } } });
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const program = await load(id);
  return { title: program ? pick(program.title, locale) : undefined };
}

const SECTIONS = ['provides', 'who', 'why', 'confirm', 'ineligible', 'docs', 'how', 'source', 'status'] as const;

export default async function ProgramPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const program = await load(id);
  if (!program) notFound();

  const t = await getTranslations('program');
  const tNav = await getTranslations('nav');
  const looseT = (await getTranslations()) as unknown as LooseT;
  const vocab = makeVocab(looseT);
  const title = pick(program.title, locale);
  const howToApply = pick(program.howToApply, locale);
  const status = reviewStatus(program);

  const eligibility = eligibilityLines(program, looseT, vocab, locale);

  // Without a match from this session: what anyone would still need to confirm, and what rules people out.
  const generalConfirm: string[] = [];
  if (program.incomeTested) generalConfirm.push(t('general.income'));
  if (program.applicationStatus !== 'OPEN') generalConfirm.push(t('general.status'));
  if (program.requiredCircumstances.length > 0) {
    generalConfirm.push(t('general.circumstance', { groups: listFormat(locale, program.requiredCircumstances.map(vocab.group)) }));
  }
  generalConfirm.push(t('general.details'));
  const generalIneligible: string[] = [];
  if (program.applicationStatus === 'CLOSED') generalIneligible.push(t('general.closed'));
  if (program.ageMin !== null || program.ageMax !== null) generalIneligible.push(t('general.age', { range: ageRangeText(program.ageMin, program.ageMax) }));
  if (program.regions.length > 0) generalIneligible.push(t('general.region', { regions: listFormat(locale, program.regions.map(vocab.region)) }));
  if (program.genders.length === 1 && program.genders[0] === 'female') generalIneligible.push(t('general.women'));

  const steps = [
    t('steps.check'),
    ...(program.requiredDocuments.length > 0 ? [t('steps.documents')] : []),
    howToApply ? t('steps.follow', { how: howToApply }) : t('steps.contact', { org: program.organization.name }),
    ...(program.sourceUrl ? [t('steps.confirmSource')] : []),
  ];

  const actions = (
    <div className="space-y-3">
      <Link href={`/apply/${program.id}`} className="btn-primary w-full" data-testid="prepare-application">
        <ClipboardList className="size-4" aria-hidden="true" />
        {t('prepareApplication')}
      </Link>
      <SaveButton program={toSaved(program)} variant="secondary" />
      <Link href="/ask" className="action w-full justify-center">
        <MessageCircle className="size-4" aria-hidden="true" />
        {t('checkFit')}
      </Link>
    </div>
  );

  return (
    <div className="page">
      <nav aria-label={t('breadcrumb')} className="meta flex flex-wrap items-center gap-x-2 pt-6 sm:pt-8">
        <Link href="/explore" className="hover:text-ink hover:underline hover:underline-offset-4">
          {tNav('browse')}
        </Link>
        <span className="text-ink-3" aria-hidden="true">
          /
        </span>
        <Link href={`/organizations/${program.organization.slug}`} className="hover:text-ink hover:underline hover:underline-offset-4">
          {program.organization.name}
        </Link>
      </nav>

      <div className="grid gap-10 pt-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <article className="min-w-0 max-w-[46rem]">
          <p className="kicker">{program.supportTypes.map(vocab.need).join(' · ')}</p>
          <h1 className="title-page mt-3">{title}</h1>
          <p className="meta mt-2">
            {t('providedBy')}{' '}
            <Link href={`/organizations/${program.organization.slug}`} className="font-medium text-ink underline-offset-4 hover:underline">
              {program.organization.name}
            </Link>
          </p>

          {/* The source and data status are part of the first screen, never buried at the bottom. */}
          <div className="card mt-6 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 [&>*]:min-w-0">
            <ProgramStatus program={program} />
            <VerificationStatus status={status} />
            <div className="sm:col-span-2">
              <ProgramSource url={program.sourceUrl} variant="button" className="w-full sm:w-auto" />
            </div>
          </div>

          <div className="mt-6 lg:hidden">{actions}</div>
          {program.origin === 'SAMPLE' && <PrototypeDataNotice />}

          <div className="mt-8 space-y-6">
            <ProgramSection id="provides" title={t('provides')}>
              <p>{pick(program.summary, locale)}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {program.supportTypes.map((type) => (
                  <li key={type} className="rounded-[6px] bg-sunken px-2.5 py-1 text-[14px] font-medium text-ink">
                    {vocab.need(type)}
                  </li>
                ))}
              </ul>
            </ProgramSection>

            <ProgramSection id="who" title={t('whoFor')}>
              <ul className="list-disc space-y-1.5 pl-5 marker:text-ink-3">
                {eligibility.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </ProgramSection>

            <MatchEvidence programId={program.id} generalConfirm={generalConfirm} generalIneligible={generalIneligible} />

            <ProgramSection id="docs" title={t('documents')}>
              {program.requiredDocuments.length === 0 ? (
                <p className="text-ink-2">{t('noDocuments')}</p>
              ) : (
                <>
                  <p className="meta mb-3">{t('documentsLead')}</p>
                  <DocumentChecklist documents={program.requiredDocuments} testId="program-documents" />
                </>
              )}
            </ProgramSection>

            <ProgramSection id="how" title={t('howToApply')}>
              <ol className="space-y-3" data-testid="apply-steps">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </ProgramSection>

            <ProgramSection id="source" title={t('officialSource')}>
              <p className="meta mb-2">{program.sourceUrl ? t('sourceLead') : t('sourceMissing')}</p>
              <ProgramSource url={program.sourceUrl} />
            </ProgramSection>

            <ProgramSection id="status" title={t('dataStatus')}>
              <DataStatus status={status} researchedAt={program.origin === 'RESEARCHED' ? program.researchedAt : null} hasSource={Boolean(program.sourceUrl)} />
            </ProgramSection>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {actions}
            <nav aria-label={t('onThisPage')} className="border-t border-line pt-5">
              <p className="label mb-2">{t('onThisPage')}</p>
              <ul className="space-y-0.5 text-[14.5px]">
                {SECTIONS.map((s) => (
                  <li key={s}>
                    <a href={`#${s}`} className="block rounded-[4px] py-1 text-ink-2 hover:text-ink hover:underline hover:underline-offset-4">
                      {t(`toc.${s}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
