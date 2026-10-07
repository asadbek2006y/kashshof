import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { DemoApplication } from '@/lib/api/client';
import { pick } from '@/lib/localized';
import { listFormat, makeVocab, type LooseT } from '@/lib/vocab';

/** One application as a list row: where it stands, what's missing, the next step. */
export async function ApplicationCard({ app, locale }: { app: DemoApplication; locale: string }) {
  const t = await getTranslations('applications');
  const vocab = makeVocab((await getTranslations()) as unknown as LooseT);
  return (
    <article className="border-b border-line py-6" data-testid="application-card">
      <p className="kicker">{app.program.organization.name}</p>
      <h2 className="title-item mt-1.5">{pick(app.program.title, locale)}</h2>
      <p className="meta mt-1">{t(`status.${app.status}`)}</p>
      {/* Real step completion (requirements, documents, statement) — not a score. */}
      <div className="mt-3 h-1.5 max-w-[24rem] overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full bg-primary" style={{ width: `${app.progress}%` }} />
      </div>
      {app.missingDocuments.length > 0 ? (
        <p className="mt-3 text-[15px] text-ink">
          <span className="text-warning">{t('missingLabel')}</span> {listFormat(locale, app.missingDocuments.map(vocab.document))}
        </p>
      ) : (
        <p className="mt-3 text-[15px] text-success">{t('allDocuments')}</p>
      )}
      <Link href={`/apply/${app.program.id}`} className="action mt-1">
        {app.status === 'not_started' ? t('start') : t('continue')} →
      </Link>
    </article>
  );
}
