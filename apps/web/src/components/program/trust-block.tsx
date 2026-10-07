import { getLocale, getTranslations } from 'next-intl/server';
import { formatDay } from '@/lib/dates';
import { ReportButton } from './report-button';

// Must match SEED_SOURCE in apps/api/prisma/seed-data.ts; shown translated instead of in English.
const SEED_SOURCE = 'Prototype sample data — not yet checked against official sources';
// Must match DIRECTORY_SOURCE in apps/api/prisma/directory-data.ts.
const DIRECTORY_SOURCE = 'Hamroh organization list (Sep 2026) — name only, not yet checked';

/** Where the information came from and how fresh it is. */
// Must match RESEARCH_SOURCE in apps/api/prisma/research-data.ts.
const RESEARCH_SOURCE = 'Collected from public sources — not yet reviewed by a person';

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function TrustBlock({
  verification,
  source,
  lastVerifiedAt,
  sourceUrl = null,
  researchedAt = null,
}: {
  verification: 'VERIFIED' | 'UNVERIFIED';
  source: string;
  lastVerifiedAt: string | null;
  sourceUrl?: string | null;
  researchedAt?: string | null;
}) {
  const t = await getTranslations('trust');
  const locale = await getLocale();
  return (
    <section aria-labelledby="trust-title">
      <h2 id="trust-title" className="kicker mb-3">{t('title')}</h2>
      <dl className="space-y-3 text-[15px]">
        <div>
          <dt className="label">{t('status')}</dt>
          <dd className={verification === 'VERIFIED' ? 'text-success' : 'text-warning'}>
            {verification === 'VERIFIED' ? t('verified') : t('unverified')}
          </dd>
        </div>
        <div>
          <dt className="label">{t('source')}</dt>
          <dd className="text-ink">
            {source === SEED_SOURCE
              ? t('sampleSource')
              : source === DIRECTORY_SOURCE
                ? t('listSource')
                : source === RESEARCH_SOURCE
                  ? t('researchSource')
                  : source}
          </dd>
          {sourceUrl && (
            <dd>
              <a href={sourceUrl} className="action min-h-9 break-all" rel="noreferrer" target="_blank" data-testid="source-link">
                {hostname(sourceUrl)} ↗
              </a>
            </dd>
          )}
        </div>
        {researchedAt && (
          <div>
            <dt className="label">{t('collected')}</dt>
            <dd className="text-ink">{formatDay(locale, new Date(researchedAt), true)}</dd>
          </div>
        )}
        <div>
          <dt className="label">{t('reviewedByPerson')}</dt>
          <dd className="text-ink">{lastVerifiedAt ? formatDay(locale, new Date(lastVerifiedAt), true) : t('never')}</dd>
        </div>
      </dl>
      <p className="meta mt-3">{t('checkOfficial')}</p>
      <ReportButton />
    </section>
  );
}
