'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Notice } from '@/components/ui/notice';
import { Link } from '@/i18n/navigation';
import { api, type ProgramDetail } from '@/lib/api/client';
import { pick } from '@/lib/localized';
import { useVocab } from '@/lib/use-vocab';

const TABS = [
  { key: 'programs' },
  { key: 'applicants' },
  { key: 'messages' },
  { key: 'analytics' },
  { key: 'profile' },
  { key: 'team' },
  { key: 'verification' },
] as const;

type Tab = (typeof TABS)[number]['key'];

export function OrgDashboard({ createdId }: { createdId?: string }) {
  const t = useTranslations('org');
  const locale = useLocale();
  const vocab = useVocab();
  const [tab, setTab] = useState<Tab>('programs');
  const [drafts, setDrafts] = useState<ProgramDetail[] | null>(null);

  useEffect(() => {
    void api.GET('/api/v1/org/programs').then(({ data }) => setDrafts(data ?? []));
  }, []);

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-10 pb-6 sm:pt-14">
        <div>
          <p className="kicker">{t('eyebrow')}</p>
          <h1 className="title-page mt-3">{t('title')}</h1>
        </div>
        <Link href="/org/new" className="btn-primary">
          {t('newProgram')}
        </Link>
      </header>

      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label={t('title')} className="flex gap-6 border-b border-line">
          {TABS.map(({ key }) => (
            <button key={key} role="tab" type="button" aria-selected={tab === key} onClick={() => setTab(key)} className="tab">
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[46rem] pt-6">
        {tab === 'programs' ? (
          <div role="tabpanel" className="space-y-6">
            {createdId && <Notice title={t('createdTitle')}>{t('createdBody')}</Notice>}
            <p className="meta">{t('draftsLead')}</p>
            {drafts?.length === 0 && <Notice>{t('noDrafts')}</Notice>}
            <ul className="border-t border-line" data-testid="org-drafts">
              {drafts?.map((d) => (
                <li key={d.id} className="border-b border-line py-5">
                  <p className="kicker">{d.organization.name}</p>
                  <p className="title-item mt-1.5">{pick(d.title, locale)}</p>
                  <p className="meta mt-1">
                    <span className="text-warning">{t('draftBadge')}</span>
                    <span className="mx-2 text-ink-3">·</span>
                    {d.supportTypes.map(vocab.need).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div role="tabpanel">
            <Notice title={t('previewTitle')}>{t(`preview.${tab}`)}</Notice>
          </div>
        )}
      </div>
    </div>
  );
}
