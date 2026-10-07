'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { ProgramCard } from '@/components/hamroh/program-card';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/states';
import { Link } from '@/i18n/navigation';
import type { ProgramSummary } from '@/lib/api/client';
import { pick } from '@/lib/localized';
import { fadeIn } from '@/lib/motion';
import { reviewStatus, type ReviewStatus } from '@/lib/review-status';
import { useVocab } from '@/lib/use-vocab';
import { CATEGORY_ORDER } from './categories';
import { filterPrograms, type BrowseFilters } from './filter-programs';

const EMPTY: BrowseFilters = { q: '', type: null, region: null, org: null, group: null, onlyOpen: false, status: null };
// Never offered as a browse filter: naming it on screen could put someone at risk.
const HIDDEN_GROUPS = new Set(['survivor']);

/**
 * Browse every program without using the assistant. Filters live in page state only — a search
 * someone types isn't written to the URL or history.
 */
export function ProgramBrowser({ programs, initialType }: { programs: ProgramSummary[]; initialType: string | null }) {
  const t = useTranslations('explore');
  const locale = useLocale();
  const vocab = useVocab();
  const [filters, setFilters] = useState<BrowseFilters>({ ...EMPTY, type: initialType });
  const query = useDeferredValue(filters.q);

  // Options come from the data itself, so no filter leads to an empty category.
  const options = useMemo(() => {
    // Node and browsers ship different Uzbek collation data, which breaks hydration; Uzbek is Latin
    // script, so English collation orders it the same way on both.
    const collator = new Intl.Collator(locale === 'uz' ? 'en' : locale);
    const types = CATEGORY_ORDER.filter((c) => programs.some((p) => p.supportTypes.includes(c)));
    const regions = [...new Set(programs.flatMap((p) => p.regions))].sort((a, b) => collator.compare(vocab.region(a), vocab.region(b)));
    const orgs = [...new Map(programs.map((p) => [p.organization.slug, p.organization.name])).entries()].sort((a, b) => collator.compare(a[1], b[1]));
    const groups = [...new Set(programs.flatMap((p) => p.targetCircumstances))].filter((g) => !HIDDEN_GROUPS.has(g));
    const statuses = [...new Set(programs.map((p) => reviewStatus(p)))];
    return { types, regions, orgs, groups, statuses };
  }, [programs, vocab, locale]);

  const visible = useMemo(
    () => filterPrograms(programs, { ...filters, q: query }, (p) => `${pick(p.title, locale)} ${pick(p.summary, locale)} ${p.organization.name}`),
    [programs, filters, query, locale],
  );

  const set = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const active = (['type', 'region', 'org', 'group', 'status'] as const).filter((k) => filters[k]).length + (filters.onlyOpen ? 1 : 0);

  const panel = (
    <div className="space-y-6">
      <FilterSelect label={t('filters.category')} value={filters.type} onChange={(v) => set('type', v)} allLabel={t('filters.all')}
        options={options.types.map((v) => [v, vocab.need(v)])} testId="filter-category" />
      <FilterSelect label={t('filters.region')} value={filters.region} onChange={(v) => set('region', v)} allLabel={t('filters.anyRegion')}
        options={options.regions.map((v) => [v, vocab.region(v)])} hint={t('filters.regionHint')} testId="filter-region" />
      <FilterSelect label={t('filters.provider')} value={filters.org} onChange={(v) => set('org', v)} allLabel={t('filters.all')}
        options={options.orgs} testId="filter-provider" />
      <FilterSelect label={t('filters.group')} value={filters.group} onChange={(v) => set('group', v)} allLabel={t('filters.anyone')}
        options={options.groups.map((v) => [v, vocab.situation(v)])} testId="filter-group" />
      <FilterSelect label={t('filters.status')} value={filters.status} onChange={(v) => set('status', v as ReviewStatus | null)} allLabel={t('filters.all')}
        options={options.statuses.map((v) => [v, t(`reviewOption.${v}`)])} testId="filter-status" />
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[16px] text-ink">
        <input type="checkbox" checked={filters.onlyOpen} onChange={(e) => set('onlyOpen', e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
        {t('filters.onlyOpen')}
      </label>
      {active > 0 && (
        <button type="button" className="action-quiet" onClick={() => setFilters({ ...EMPTY, q: filters.q })}>
          <X className="size-4" aria-hidden="true" />
          {t('filters.clear')}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block" aria-label={t('filters.title')}>
        <div className="sticky top-24">
          <h2 className="mb-4 text-[16px] font-semibold text-ink">{t('filters.title')}</h2>
          {panel}
        </div>
      </aside>

      <div className="min-w-0 max-w-[50rem]">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="program-search" className="sr-only">
              {t('searchLabel')}
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input
              id="program-search"
              type="search"
              value={filters.q}
              onChange={(e) => set('q', e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="field min-h-12 pl-11"
              autoComplete="off"
              data-testid="program-search"
            />
          </div>
          <Dialog>
            <DialogTrigger className="btn-secondary min-h-12 px-4 lg:hidden" data-testid="open-filters">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {t('filters.title')}
              {active > 0 && <span className="rounded-full bg-primary px-1.5 text-[12px] text-white">{active}</span>}
            </DialogTrigger>
            <DialogContent variant="sheet" title={t('filters.title')}>
              {panel}
              {/* Reachable with a thumb: closes the sheet and shows the filtered list. */}
              <div className="sticky -bottom-5 -mx-5 mt-6 border-t border-line bg-surface px-5 pt-3 pb-5">
                <DialogClose className="btn-primary w-full" data-testid="apply-filters">
                  {t('filters.show', { count: visible.length })}
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="meta mt-4" role="status" data-testid="program-count">
          {t('count', { count: visible.length })}
        </p>

        {visible.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={t('noneTitle')}
            body={t('noneBody')}
            actions={
              <>
                <button type="button" className="btn-primary" onClick={() => setFilters(EMPTY)}>
                  {t('filters.clear')}
                </button>
                <Link href="/ask" className="btn-secondary">
                  {t('askInstead')}
                </Link>
              </>
            }
          />
        ) : (
          <motion.div key={visible.length} variants={fadeIn} initial="hidden" animate="visible" className="mt-4 grid gap-4" data-testid="program-list">
            {visible.map((program) => (
              <ProgramCard key={program.id} program={program} headingLevel={2} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  hint,
  testId,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: ReadonlyArray<readonly [string, string]>;
  allLabel: string;
  hint?: ReactNode;
  testId: string;
}) {
  const id = `${testId}-select`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium text-ink">
        {label}
      </label>
      <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className="field min-h-12 appearance-auto" data-testid={testId}>
        <option value="">{allLabel}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[13.5px] leading-snug text-ink-2">{hint}</p>}
    </div>
  );
}
