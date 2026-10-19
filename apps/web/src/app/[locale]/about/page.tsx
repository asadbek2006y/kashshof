import { ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrgVerification } from '@/components/hamroh/org-verification';
import { PageHeader } from '@/components/ui/page-header';
import { Link } from '@/i18n/navigation';
import { ORG_VERIFICATIONS } from '@/lib/review-status';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('about'))('title') };
}

/**
 * What Kashshof is, where its information comes from and how far it has been checked. The
 * graduation-project background lives here rather than on every page.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('about');
  const tVerification = await getTranslations('verification');

  return (
    <div className="page pb-16">
      <PageHeader title={t('title')} lead={t('lead')} />
      <div className="max-w-[44rem] space-y-10">
        <section aria-labelledby="about-data" className="rule pt-7">
          <h2 id="about-data" className="title-section">
            {t('dataTitle')}
          </h2>
          <p className="mt-3 text-ink">{t('dataBody')}</p>
        </section>

        <section aria-labelledby="about-status" className="rule pt-7" data-testid="about-statuses">
          <h2 id="about-status" className="title-section">
            {t('statusTitle')}
          </h2>
          <div className="mt-4 space-y-4">
            {ORG_VERIFICATIONS.map((status) => (
              <OrgVerification key={status} status={status} detailed className="text-[15px]" />
            ))}
          </div>
          <p className="meta mt-4">{tVerification('notEligibility')}</p>
        </section>

        <section aria-labelledby="about-decide" className="rule pt-7">
          <h2 id="about-decide" className="title-section">
            {t('decideTitle')}
          </h2>
          <p className="mt-3 text-ink">{t('decideBody')}</p>
        </section>

        <section aria-labelledby="about-errors" className="rule pt-7">
          <h2 id="about-errors" className="title-section">
            {t('errorsTitle')}
          </h2>
          <p className="mt-3 text-ink">{t('errorsBody')}</p>
          <Link href="/organizations" className="action mt-2">
            {t('errorsLink')} →
          </Link>
        </section>

        <section aria-labelledby="about-project" className="rule pt-7">
          <h2 id="about-project" className="title-section">
            {t('projectTitle')}
          </h2>
          <p className="mt-3 text-ink-2">{t('projectBody')}</p>
        </section>

        <Link href="/safety" className="action text-danger">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          {t('urgent')}
        </Link>
      </div>
    </div>
  );
}
