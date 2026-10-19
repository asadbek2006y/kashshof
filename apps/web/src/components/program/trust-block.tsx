import { ExternalLink, FileQuestion } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { OrgVerification } from '@/components/hamroh/org-verification';
import type { OrganizationDetail } from '@/lib/api/client';
import { formatDay } from '@/lib/dates';
import { sourceHost } from '@/lib/review-status';
import { ReportButton } from './report-button';

// Must match SEED_SOURCE in apps/api/prisma/seed-data.ts; shown translated instead of in English.
const SEED_SOURCE = 'Prototype sample data — not yet checked against official sources';
// Must match DIRECTORY_SOURCE in apps/api/prisma/directory-data.ts.
const DIRECTORY_SOURCE = 'Hamroh organization list (Sep 2026) — name only, not yet checked';
// Must match RESEARCH_SOURCE in apps/api/prisma/research-data.ts.
const RESEARCH_SOURCE = 'Collected from public sources — not yet reviewed by a person';

type Trust = Pick<
  OrganizationDetail,
  'slug' | 'verification' | 'source' | 'sourceUrl' | 'sourceName' | 'researchedAt' | 'lastVerifiedAt' | 'verificationNote'
>;

/** Where the information came from, how far it has been checked, and what that does not mean. */
export async function TrustBlock({ org }: { org: Trust }) {
  const t = await getTranslations('trust');
  const locale = await getLocale();
  const host = sourceHost(org.sourceUrl);
  const origin =
    org.source === SEED_SOURCE
      ? t('sampleSource')
      : org.source === DIRECTORY_SOURCE
        ? t('listSource')
        : org.source === RESEARCH_SOURCE
          ? t('researchSource')
          : org.source;

  return (
    <section aria-labelledby="trust-title" data-testid="trust-block">
      <h2 id="trust-title" className="kicker mb-3">
        {t('title')}
      </h2>
      <OrgVerification status={org.verification} detailed />

      <dl className="mt-4 space-y-3 text-[15px]">
        <div>
          <dt className="label">{t('source')}</dt>
          {org.sourceUrl && host ? (
            <dd className="mt-0.5">
              <a
                href={org.sourceUrl}
                className="action min-h-11 max-w-full break-all"
                rel="noreferrer noopener"
                referrerPolicy="no-referrer"
                target="_blank"
                data-testid="source-link"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{org.sourceName || host}</span>
                <span className="sr-only">{t('opensNewTab')}</span>
              </a>
            </dd>
          ) : (
            <dd className="mt-0.5 flex items-start gap-1.5 text-ink-2" data-testid="source-unavailable">
              <FileQuestion className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t('noSource')}
            </dd>
          )}
          <dd className="meta mt-1 text-[14px]">{origin}</dd>
        </div>
        {org.researchedAt && (
          <div>
            <dt className="label">{t('collected')}</dt>
            <dd className="text-ink">{formatDay(locale, new Date(org.researchedAt), true)}</dd>
          </div>
        )}
        <div>
          <dt className="label">{t('lastVerified')}</dt>
          <dd className="text-ink">
            {org.lastVerifiedAt ? formatDay(locale, new Date(org.lastVerifiedAt), true) : <span className="text-ink-2">{t('notYetVerified')}</span>}
          </dd>
          {org.verificationNote && <dd className="meta mt-1 text-[14px]">{org.verificationNote}</dd>}
        </div>
      </dl>

      <p className="meta mt-4 text-[14px]">{t('notEligibility')}</p>
      <ReportButton orgSlug={org.slug} />
    </section>
  );
}
