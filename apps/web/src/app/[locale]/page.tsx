import {
  ArrowRight,
  BookOpen,
  FileSearch,
  LifeBuoy,
  ListChecks,
  MessageCircle,
  Scale,
  UserX,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import motherChild from '@/assets/media/mother-child-samarkand.jpg';
import womanDasturkhan from '@/assets/media/woman-dasturkhan.jpg';
import { DemoSituations } from '@/features/home/demo-situations';
import { FeaturedPrograms } from '@/features/home/featured-programs';
import { HeroMedia } from '@/features/home/hero-media';
import { StoryPhoto } from '@/features/home/story-photo';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';

const STEPS = ['tell', 'check', 'why', 'next'] as const;
const PREVIEW_PROGRAMS = 4;
const PREVIEW_ORGS = 6;
const TRUST = [
  { key: 'noAccount', icon: UserX },
  { key: 'explains', icon: ListChecks },
  { key: 'sources', icon: FileSearch },
] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tDir = await getTranslations('directory');
  const tKind = await getTranslations('orgKind');

  // Real counts from the database, and whether AI assistance is switched on — no invented numbers.
  const [{ data: programs }, { data: info }, { data: orgs }] = await Promise.all([
    serverApi.GET('/api/v1/programs'),
    serverApi.GET('/api/v1/assistant/info'),
    serverApi.GET('/api/v1/organizations', { params: { query: {} } }),
  ]);
  const organizations = new Set((programs ?? []).map((p) => p.organization.slug)).size;
  // Organizations with collected programs first, so the preview leads somewhere useful.
  const featuredOrgs = [...(orgs ?? [])]
    .sort((a, b) => b.programs.length - a.programs.length)
    .slice(0, PREVIEW_ORGS);

  return (
    <>
      {/* The only moving part of the page: real life in Uzbekistan behind the opening, fading into the
          cream page before anything else. Text keeps full contrast over a strong wash. */}
      <section
        className="relative isolate overflow-hidden"
        aria-labelledby="hero-title"
        data-testid="home-hero"
      >
        <HeroMedia />
        <div className="page relative pt-[12.5rem] pb-8 sm:pt-[16.5rem] lg:flex lg:min-h-[36rem] lg:items-center lg:pt-16 lg:pb-24">
          <div className="max-w-[40rem] lg:max-w-[32rem] xl:max-w-[40rem]">
            <h1 id="hero-title" className="title-page sm:text-[52px] sm:leading-[1.08]">
              {t('title')}
            </h1>
            <p className="lead mt-5 max-w-[36rem] text-ink-2">{t('lead')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/ask"
                className="btn-primary px-6 text-[17px]"
                data-testid="cta-find-support"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                {t('ctaFind')}
              </Link>
              <Link href="/explore" className="btn-secondary px-6 text-[17px]">
                <BookOpen className="size-5" aria-hidden="true" />
                {t('ctaBrowse')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page">
        {/* Urgent help sits on the plain page, never over the moving hero. */}
        <Link
          href="/safety"
          className="inline-flex min-h-11 items-center gap-2 text-[16px] font-semibold text-danger underline-offset-4 hover:underline"
          data-testid="home-urgent"
        >
          <LifeBuoy className="size-5" aria-hidden="true" />
          {t('urgent')}
        </Link>

        <section className="pt-6 pb-12" aria-label={t('trustLabel')}>
          <ul className="grid gap-3 sm:grid-cols-3">
            {TRUST.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-4"
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-[16px] font-semibold text-ink">{t(`trust.${key}.title`)}</p>
                  <p className="mt-0.5 text-[14.5px] leading-snug text-ink-2">
                    {t(`trust.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="meta mt-4 text-[14px]" data-testid="data-facts">
            {t('facts', { programs: programs?.length ?? 0, organizations })}{' '}
            {info?.aiAvailable ? t('aiOn') : t('aiOff')}
          </p>
        </section>

        {programs && programs.length > 0 && (
          <section aria-labelledby="programs-title" className="border-t border-line py-12">
            <h2 id="programs-title" className="title-section">
              {t('programsTitle')}
            </h2>
            <p className="meta mt-1.5 max-w-[42rem]">{t('programsLead')}</p>
            <div className="mt-6">
              <FeaturedPrograms programs={programs.slice(0, PREVIEW_PROGRAMS)} />
            </div>
            <Link href="/explore" className="action mt-5" data-testid="home-programs-all">
              {t('programsAll', { count: programs.length })}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        {featuredOrgs.length > 0 && (
          <section aria-labelledby="orgs-title" className="border-t border-line py-12">
            <h2 id="orgs-title" className="title-section">
              {t('orgsTitle')}
            </h2>
            <p className="meta mt-1.5 max-w-[42rem]">{t('orgsLead')}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-orgs">
              {featuredOrgs.map((org) => (
                <li key={org.slug}>
                  <Link
                    href={`/organizations/${org.slug}`}
                    className="group flex h-full flex-col rounded-[var(--radius-md)] border border-line bg-surface px-4 py-4"
                  >
                    <span className="title-item break-words group-hover:underline group-hover:underline-offset-4">
                      {org.name}
                    </span>
                    <span className="meta mt-1">{tKind(org.kind)}</span>
                    <span className="mt-auto pt-3 text-[14px] text-ink-2">
                      {org.programs.length > 0
                        ? tDir('programs', { count: org.programs.length })
                        : tDir('noPrograms')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/organizations" className="action mt-5" data-testid="home-orgs-all">
              {t('orgsAll', { count: orgs?.length ?? 0 })}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        <section aria-labelledby="how-title" className="border-t border-line py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <h2 id="how-title" className="title-section">
                {t('howTitle')}
              </h2>
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {STEPS.map((step, i) => (
                  <li key={step} className="card p-5">
                    <span
                      className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-[15px] font-bold text-primary"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <h3 className="mt-3 text-[17px] font-semibold text-ink">
                      {t(`how.${step}.title`)}
                    </h3>
                    <p className="mt-1 text-[15px] leading-snug text-ink-2">
                      {t(`how.${step}.body`)}
                    </p>
                  </li>
                ))}
              </ol>
              <Link href="/how-it-works" className="action mt-4">
                {t('howLink')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <StoryPhoto src={womanDasturkhan} media="dasturkhan" className="lg:pt-14" />
          </div>
        </section>

        <section aria-labelledby="demo-title" className="border-t border-line py-12">
          <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-12">
            <div className="min-w-0 lg:order-last">
              <h2 id="demo-title" className="title-section">
                {t('demoTitle')}
              </h2>
              <p className="meta mt-1.5 max-w-[42rem]">{t('demoLead')}</p>
              <div className="mt-6">
                <DemoSituations stacked />
              </div>
            </div>
            <StoryPhoto src={motherChild} media="motherChild" className="lg:pt-2" />
          </div>
        </section>

        <section aria-labelledby="clarify-title" className="border-t border-line py-12">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="flex gap-3">
              <Scale className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 id="clarify-title" className="text-[21px] font-semibold text-ink">
                  {t('clarifyTitle')}
                </h2>
                <p className="mt-2 text-[16px] text-ink-2">{t('clarifyBody')}</p>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger-soft p-5">
              <h2 className="flex items-center gap-2 text-[19px] font-semibold text-ink">
                <LifeBuoy className="size-5 text-danger" aria-hidden="true" />
                {t('safetyTitle')}
              </h2>
              <p className="mt-1.5 text-[15.5px] text-ink">{t('safetyBody')}</p>
              <Link href="/safety" className="btn-danger mt-4">
                {t('safetyCta')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
