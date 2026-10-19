import { ExternalLink, MapPin, Phone, SlidersHorizontal } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrgVerification, VerificationLegend } from '@/components/hamroh/org-verification';
import { FilterNav, filterItemClass } from '@/components/ui/filter-nav';
import { Notice } from '@/components/ui/notice';
import { PageHeader } from '@/components/ui/page-header';
import { orgFacts } from '@/features/organizations/org-facts';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import type { Schemas } from '@/lib/api/client';
import { pick } from '@/lib/localized';
import { isOrgVerification, ORG_VERIFICATIONS, sourceHost } from '@/lib/review-status';
import { listFormat, makeVocab, REGIONS, SUPPORT_TYPES, type LooseT } from '@/lib/vocab';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('directory'))('title') };
}

type Section = NonNullable<Schemas['OrganizationDetailDto']['sections']>[number];
type Kind = Schemas['OrganizationDetailDto']['kind'];
const SECTIONS: Section[] = [
  'women_girls', 'children_family', 'health', 'social_support', 'disability',
  'education_youth', 'food_humanitarian', 'emergency', 'faith_zakat', 'development',
];
const KINDS: Kind[] = ['NGO', 'GOVERNMENT', 'INTERNATIONAL'];

type Filters = {
  section?: Section;
  q?: string;
  status?: (typeof ORG_VERIFICATIONS)[number];
  kind?: Kind;
  need?: (typeof SUPPORT_TYPES)[number];
  region?: (typeof REGIONS)[number];
};

const oneOf = <T extends string>(values: readonly T[], value: string | undefined): T | undefined =>
  values.includes(value as T) ? (value as T) : undefined;

/** Query for a link that keeps the current filters, with some changed. */
function query(filters: Filters, change: Partial<Filters> = {}): Record<string, string> {
  return Object.fromEntries(Object.entries({ ...filters, ...change }).filter(([, v]) => v)) as Record<string, string>;
}

/**
 * The organization directory: every listed organization, including ones with no programs or
 * source collected yet — their status says so instead of hiding them. Search and filters are plain
 * links and GET forms, so they work without JavaScript.
 */
export default async function OrganizationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const filters: Filters = {
    section: oneOf(SECTIONS, raw.section),
    q: raw.q?.trim().slice(0, 100) || undefined,
    status: isOrgVerification(raw.status) ? raw.status : undefined,
    kind: oneOf(KINDS, raw.kind),
    need: oneOf(SUPPORT_TYPES, raw.need),
    region: oneOf(REGIONS, raw.region),
  };
  const extraFilters = [filters.status, filters.kind, filters.need, filters.region].filter(Boolean).length;
  const t = await getTranslations('directory');
  const tSection = await getTranslations('section');
  const tKind = await getTranslations('orgKind');
  const tVerification = await getTranslations('verification');
  const vocab = makeVocab((await getTranslations()) as unknown as LooseT);

  const { data: orgs, error } = await serverApi.GET('/api/v1/organizations', {
    params: {
      query: {
        section: filters.section,
        q: filters.q,
        status: filters.status,
        kind: filters.kind,
        supportType: filters.need,
        region: filters.region,
      },
    },
  });
  const filtered = Boolean(filters.q || filters.section || extraFilters);

  return (
    <div className="page">
      <PageHeader title={t('title')} lead={t('lead')} />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <FilterNav label={t('sections')}>
          <li>
            <Link
              href={{ pathname: '/organizations', query: query(filters, { section: undefined }) }}
              className={filterItemClass(!filters.section)}
              aria-current={!filters.section ? 'page' : undefined}
            >
              {t('all')}
            </Link>
          </li>
          {SECTIONS.map((s) => (
            <li key={s}>
              <Link
                href={{ pathname: '/organizations', query: query(filters, { section: s }) }}
                className={filterItemClass(filters.section === s)}
                aria-current={filters.section === s ? 'page' : undefined}
              >
                {tSection(s)}
              </Link>
            </li>
          ))}
        </FilterNav>

        <div className="max-w-[48rem] min-w-0">
          <form role="search" action="" className="space-y-3" data-testid="directory-filters">
            {filters.section && <input type="hidden" name="section" value={filters.section} />}
            <div className="flex gap-2">
              <label htmlFor="org-search" className="sr-only">
                {t('searchLabel')}
              </label>
              <input
                id="org-search"
                type="search"
                name="q"
                defaultValue={filters.q}
                maxLength={100}
                placeholder={t('searchPlaceholder')}
                className="field min-w-0 flex-1"
                data-testid="directory-search"
              />
              <button type="submit" className="btn-secondary shrink-0 px-4">
                {t('search')}
              </button>
            </div>

            <details className="group rounded-[var(--radius-md)] border border-line bg-surface" open={extraFilters > 0}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-2 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="size-4 shrink-0 text-ink-2" aria-hidden="true" />
                {t('moreFilters')}
                {extraFilters > 0 && <span className="text-ink-2">({extraFilters})</span>}
              </summary>
              <div className="grid gap-3 border-t border-line px-4 py-4 sm:grid-cols-2">
                <Select name="status" label={t('filterStatus')} value={filters.status} any={t('anyStatus')}
                  options={ORG_VERIFICATIONS.map((s) => [s, tVerification(`label.${s}`)])} />
                <Select name="kind" label={t('filterKind')} value={filters.kind} any={t('anyKind')}
                  options={KINDS.map((k) => [k, tKind(k)])} />
                <Select name="need" label={t('filterNeed')} value={filters.need} any={t('anyNeed')}
                  options={SUPPORT_TYPES.map((n) => [n, vocab.need(n)])} />
                <Select name="region" label={t('filterRegion')} value={filters.region} any={t('anyRegion')}
                  options={REGIONS.map((r) => [r, vocab.region(r)])} />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2">
                  <button type="submit" className="btn-primary" data-testid="directory-apply">
                    {t('apply')}
                  </button>
                  {filtered && (
                    <Link href="/organizations" className="action-quiet">
                      {t('clear')}
                    </Link>
                  )}
                </div>
                {filters.region && <p className="meta text-[14px] sm:col-span-2">{t('regionNote')}</p>}
              </div>
            </details>
          </form>

          <VerificationLegend className="mt-3" />

          {error && (
            <div className="mt-6">
              <Notice tone="warn" role="alert">
                {t('error')}
              </Notice>
            </div>
          )}
          {orgs && (
            <p className="meta mt-6 mb-3" data-testid="directory-count" role="status">
              {t('count', { count: orgs.length })}
            </p>
          )}
          {orgs && orgs.length === 0 && (
            <Notice title={t('noneTitle')}>
              <p>{filters.q ? t('noneQuery', { q: filters.q }) : t('none')}</p>
              <Link href="/organizations" className="action mt-1">
                {t('clear')}
              </Link>
            </Notice>
          )}

          <ul className="grid gap-3" data-testid="directory-list">
            {orgs?.map((org) => {
              const description = pick(org.description, locale);
              const facts = orgFacts(org);
              const host = sourceHost(org.website);
              const where =
                facts.coverage.kind === 'nationwide'
                  ? t('nationwide')
                  : facts.coverage.kind === 'regions'
                    ? listFormat(locale, facts.coverage.regions.slice(0, 3).map(vocab.region)) +
                      (facts.coverage.regions.length > 3 ? ` +${facts.coverage.regions.length - 3}` : '')
                    : null;
              return (
                <li key={org.slug}>
                  <article className="card min-w-0 p-4 sm:p-5" data-testid="org-card" data-org={org.slug}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <h2 className="title-item break-words">
                          <Link href={`/organizations/${org.slug}`} className="rounded-[4px] hover:underline hover:underline-offset-4">
                            {org.name}
                          </Link>
                        </h2>
                        <p className="meta mt-0.5 text-[14px]">
                          {[tKind(org.kind), ...org.sections.slice(0, 2).map((s) => tSection(s as Section))].join(' · ')}
                        </p>
                      </div>
                      <OrgVerification
                        status={org.verification}
                        lastVerifiedAt={org.lastVerifiedAt}
                        className="shrink-0 sm:max-w-[13rem] sm:pt-1"
                      />
                    </div>

                    <p className={`mt-3 line-clamp-2 text-[15px] leading-relaxed ${description ? 'text-ink' : 'text-ink-2'}`}>
                      {description || t('noDescription')}
                    </p>

                    <p className="meta mt-3 flex items-start gap-1.5 border-t border-line pt-3 text-[14px]">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {where ?? t('areaUnknown')} ·{' '}
                        {org.programs.length > 0 ? t('programs', { count: org.programs.length }) : t('noPrograms')}
                      </span>
                    </p>
                    {(org.website || org.phone) && (
                      <div className="flex flex-wrap items-center gap-x-5" data-testid="org-card-contact">
                        {org.website && host && (
                          <a href={org.website} className="action min-w-0 text-[15px]" rel="noreferrer noopener" target="_blank">
                            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{host}</span>
                            <span className="sr-only">{t('opensNewTab')}</span>
                          </a>
                        )}
                        {org.phone && (
                          <a href={`tel:${org.phone.replace(/[^\d+]/g, '')}`} className="action text-[15px]">
                            <Phone className="size-4 shrink-0" aria-hidden="true" />
                            {org.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
          <p className="meta mt-6 text-[14px]">{t('sourceNote')}</p>
        </div>
      </div>
    </div>
  );
}

function Select({
  name,
  label,
  value,
  any,
  options,
}: {
  name: string;
  label: string;
  value: string | undefined;
  any: string;
  options: [string, string][];
}) {
  const id = `filter-${name}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} name={name} defaultValue={value ?? ''} className="field mt-1 min-h-12" data-testid={id}>
        <option value="">{any}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
