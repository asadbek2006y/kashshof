import { ArrowDown, Bot, Database, FileText, ListChecks, MessageSquare, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('how'))('title') };
}

// The system, top to bottom. `decides` marks the deterministic parts.
const FLOW = [
  { key: 'story', icon: MessageSquare, kind: 'person' },
  { key: 'assistant', icon: Bot, kind: 'language' },
  { key: 'facts', icon: ListChecks, kind: 'data' },
  { key: 'rules', icon: Scale, kind: 'decides' },
  { key: 'database', icon: Database, kind: 'decides' },
  { key: 'explanation', icon: FileText, kind: 'person' },
] as const;

const PRINCIPLES = ['private', 'honest', 'sources', 'safety'] as const;
const CANNOT = ['decide', 'submit', 'verify', 'history'] as const;

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('how');
  return (
    <div className="page">
      <div className="max-w-[46rem] pt-8 sm:pt-12">
        <h1 className="title-page">{t('title')}</h1>
        <p className="lead mt-3">{t('lead')}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
        <section aria-labelledby="flow-title">
          <h2 id="flow-title" className="title-section">
            {t('flowTitle')}
          </h2>
          <ol className="mt-5" data-testid="system-flow">
            {FLOW.map(({ key, icon: Icon, kind }, i) => (
              <li key={key}>
                <div
                  className={`flex gap-3 rounded-[var(--radius-md)] border p-4 ${
                    kind === 'decides'
                      ? 'border-primary/40 bg-primary-soft'
                      : kind === 'language'
                        ? 'border-dashed border-line-strong bg-surface'
                        : 'border-line bg-surface'
                  }`}
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-[16px] font-semibold text-ink">{t(`flow.${key}.title`)}</h3>
                    <p className="mt-0.5 text-[14.5px] leading-snug text-ink-2">{t(`flow.${key}.body`)}</p>
                  </div>
                </div>
                {i < FLOW.length - 1 && (
                  <div className="flex justify-center py-1.5" aria-hidden="true">
                    <ArrowDown className="size-4 text-ink-3" />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] border border-primary/40 bg-primary-soft" aria-hidden="true" />
              {t('legendDecides')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] border border-dashed border-line-strong bg-surface" aria-hidden="true" />
              {t('legendLanguage')}
            </span>
          </p>
        </section>

        <div className="space-y-10">
          <section aria-labelledby="llm-title" className="rounded-[var(--radius-lg)] border border-primary/30 bg-surface p-5 sm:p-6">
            <h2 id="llm-title" className="text-[21px] font-semibold text-ink">
              {t('llmTitle')}
            </h2>
            <p className="mt-2 text-[16px] text-ink">{t('llmBody')}</p>
            <p className="mt-3 text-[15px] text-ink-2">{t('llmPrivate')}</p>
          </section>

          <section aria-labelledby="principles">
            <h2 id="principles" className="title-section">
              {t('principlesTitle')}
            </h2>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <div key={p}>
                  <dt className="text-[16px] font-semibold text-ink">{t(`principles.${p}.title`)}</dt>
                  <dd className="meta mt-1">{t(`principles.${p}.body`)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="cannot">
            <h2 id="cannot" className="title-section">
              {t('cannotTitle')}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[16px] text-ink marker:text-ink-3">
              {CANNOT.map((c) => (
                <li key={c}>{t(`cannot.${c}`)}</li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <Link href="/ask" className="btn-primary">
              {t('cta')}
            </Link>
            <Link href="/explore" className="btn-secondary">
              {t('ctaBrowse')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
