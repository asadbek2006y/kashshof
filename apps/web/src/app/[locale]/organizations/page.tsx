import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilterNav, filterItemClass } from '@/components/ui/filter-nav';
import { Notice } from '@/components/ui/notice';
import { PageHeader } from '@/components/ui/page-header';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import type { Schemas } from '@/lib/api/client';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('directory'))('title') };
}

type Section = NonNullable<Schemas['OrganizationDetailDto']['sections']>[number];
const SECTIONS: Section[] = [
  'women_girls', 'children_family', 'health', 'social_support', 'disability',
  'education_youth', 'food_humanitarian', 'emergency', 'faith_zakat', 'development',
];

/**
 * The organization directory: every listed organization, including ones with no programs
 * collected yet. Search and filters are plain links/GET forms, so it works without JavaScript.
 */
export default async function OrganizationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string; q?: string }>;
}) {
  setRequestLocale((await params).locale);
  const { section: rawSection, q: rawQ } = await searchParams;
  const section = SECTIONS.includes(rawSection as Section) ? (rawSection as Section) : undefined;
  const q = rawQ?.trim().slice(0, 100) || undefined;
  const t = await getTranslations('directory');
  const tSection = await getTranslations('section');
  const tKind = await getTranslations('orgKind');
  const tTrust = await getTranslations('trust');

  const { data: orgs, error } = await serverApi.GET('/api/v1/organizations', { params: { query: { section, q } } });

  return (
    <div className="page">
      <PageHeader title={t('title')} lead={t('lead')} />
      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <FilterNav label={t('sections')}>
          <li>
            <Link href={{ pathname: '/organizations', query: q ? { q } : {} }} className={filterItemClass(!section)} aria-current={!section ? 'page' : undefined}>
              {t('all')}
            </Link>
          </li>
          {SECTIONS.map((s) => (
            <li key={s}>
              <Link
                href={{ pathname: '/organizations', query: { section: s, ...(q ? { q } : {}) } }}
                className={filterItemClass(section === s)}
                aria-current={section === s ? 'page' : undefined}
              >
                {tSection(s)}
              </Link>
            </li>
          ))}
        </FilterNav>

        <div className="max-w-[48rem] min-w-0">
          <form role="search" action="" className="flex gap-2">
            {section && <input type="hidden" name="section" value={section} />}
            <label htmlFor="org-search" className="sr-only">
              {t('searchLabel')}
            </label>
            <input
              id="org-search"
              name="q"
              defaultValue={q}
              maxLength={100}
              placeholder={t('searchPlaceholder')}
              className="field min-w-0 flex-1"
              data-testid="directory-search"
            />
            <button type="submit" className="btn-secondary">
              {t('search')}
            </button>
          </form>

          {error && <div className="mt-6"><Notice tone="warn">{t('error')}</Notice></div>}
          {orgs && (
            <p className="meta mt-5 mb-1" data-testid="directory-count">
              {t('count', { count: orgs.length })}
            </p>
          )}
          {orgs && orgs.length === 0 && <Notice>{t('none')}</Notice>}

          <ul data-testid="directory-list">
            {orgs?.map((org) => (
              <li key={org.slug} className="border-b border-line">
                <Link href={`/organizations/${org.slug}`} className="group grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:gap-x-8">
                  <span>
                    <span className="title-item block group-hover:underline group-hover:underline-offset-4">{org.name}</span>
                    <span className="meta mt-1 block">
                      {[tKind(org.kind), ...org.sections.slice(0, 2).map((s) => tSection(s as Section))].join(' · ')}
                    </span>
                  </span>
                  <span className="text-[14px] text-ink-2 sm:text-right">
                    <span className={`block ${org.verification === 'VERIFIED' ? 'text-success' : 'text-ink-3'}`}>
                      {org.verification === 'VERIFIED' ? tTrust('verified') : tTrust('unverified')}
                    </span>
                    <span className="block">{org.programs.length > 0 ? t('programs', { count: org.programs.length }) : t('noPrograms')}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="meta mt-6">{t('sourceNote')}</p>
        </div>
      </div>
    </div>
  );
}
