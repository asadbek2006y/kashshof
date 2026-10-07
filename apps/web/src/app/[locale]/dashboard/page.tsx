import type { Metadata } from 'next';
import { getNow, getTranslations, setRequestLocale } from 'next-intl/server';
import { DemoPersonaNotice, Notice } from '@/components/ui/notice';
import { Link } from '@/i18n/navigation';
import { serverApi } from '@/lib/api/server';
import { daysBetween } from '@/lib/dates';
import { pick } from '@/lib/localized';
import { listFormat, makeVocab, type LooseT } from '@/lib/vocab';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('dashboard'))('metaTitle') };
}

const DAY = 24 * 60 * 60 * 1000;

/** Answers one question: what should I do next? No statistic tiles. */
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const vocab = makeVocab((await getTranslations()) as unknown as LooseT);
  const now = await getNow();
  const { data: persona } = await serverApi.GET('/api/v1/demo/persona');
  if (!persona) return <div className="page pt-10"><Notice tone="warn">{t('error')}</Notice></div>;

  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Tashkent' }).format(now));
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const needsAttention = persona.applications.filter(
    (a) =>
      a.status === 'in_progress' ||
      (a.program.deadline && new Date(a.program.deadline).getTime() - now.getTime() < 30 * DAY),
  );

  return (
    <div className="page">
      <div className="max-w-[44rem] pt-10 sm:pt-14">
        <h1 className="title-page">{t(`greeting.${greeting}`, { name: persona.name })}</h1>
        <p className="lead mt-3">{t('attention', { count: needsAttention.length })}</p>

        <div className="mt-6">
          <DemoPersonaNotice />
        </div>

        <ul className="mt-8 border-t border-line">
          {needsAttention.map((app) => {
            const days = app.program.deadline ? daysBetween(now, new Date(app.program.deadline)) : null;
            return (
              <li key={app.id} className="border-b border-line py-6">
                <h2 className="title-item">{pick(app.program.title, locale)}</h2>
                <p className="meta mt-1">
                  {app.status === 'in_progress' ? t('incomplete') : t('notStarted')}
                  {days !== null && (
                    <>
                      <span className="mx-2 text-ink-3">·</span>
                      <span className={days <= 14 ? 'text-warning' : ''}>{t('deadlineIn', { count: days })}</span>
                    </>
                  )}
                </p>
                {app.missingDocuments.length > 0 ? (
                  <p className="mt-3 text-[15px] text-ink">
                    <span className="label block">{t('missing')}</span>
                    {listFormat(locale, app.missingDocuments.map(vocab.document))}
                  </p>
                ) : (
                  <p className="mt-3 text-[15px] text-success">{t('allDocuments')}</p>
                )}
                <Link href={`/apply/${app.program.id}`} className="action mt-1">
                  {app.status === 'in_progress' ? t('continue') : t('review')} →
                </Link>
              </li>
            );
          })}

          {persona.recommendations.length > 0 && (
            <li className="border-b border-line py-6">
              <h2 className="title-item">{t('newPrograms', { count: persona.recommendations.length })}</h2>
              <ul className="mt-2 space-y-1">
                {persona.recommendations.map((r) => (
                  <li key={r.program.id}>
                    <Link href={`/programs/${r.program.id}`} className="action min-h-9">
                      {pick(r.program.title, locale)} →
                    </Link>
                    <span className="meta ml-2">{r.program.organization.name}</span>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>

        <Link href="/applications" className="action-quiet mt-4">
          {t('allApplications')} →
        </Link>
      </div>
    </div>
  );
}
