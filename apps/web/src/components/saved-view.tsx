'use client';

import { Heart, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/states';
import { Link } from '@/i18n/navigation';
import { pick } from '@/lib/localized';
import { useSaved } from '@/lib/use-saved';
import { useVocab } from '@/lib/use-vocab';

export function SavedView() {
  const t = useTranslations('saved');
  const tStatus = useTranslations('status');
  const tMatch = useTranslations('match');
  const locale = useLocale();
  const vocab = useVocab();
  const { saved, toggle, clear } = useSaved();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="page">
      <div className="max-w-[48rem]">
        <PageHeader title={t('title')} lead={t('lead')} />
        {saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t('emptyTitle')}
            body={t('empty')}
            actions={
              <>
                <Link href="/explore" className="btn-primary">
                  {t('emptyBrowse')}
                </Link>
                <Link href="/ask" className="btn-secondary">
                  {t('emptyCta')}
                </Link>
              </>
            }
          />
        ) : (
          <>
            <ul className="grid gap-3" data-testid="saved-list">
              {saved.map((s) => (
                <li key={s.id} className="card p-5">
                  <p className="kicker">{s.orgName}</p>
                  <Link href={`/programs/${s.id}`} className="title-item mt-1.5 block hover:underline hover:underline-offset-4">
                    {pick(s.title, locale)}
                  </Link>
                  <p className="meta mt-0.5">
                    {s.supportTypes.slice(0, 2).map(vocab.need).join(' · ')}
                    <span className="mx-2 text-ink-3">·</span>
                    {tStatus(s.applicationStatus)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-6">
                    <Link href={`/programs/${s.id}`} className="action">
                      {tMatch('viewDetails')}
                    </Link>
                    <button type="button" className="action-quiet" onClick={() => toggle(s)}>
                      {t('remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-line pt-5">
              <p className="meta max-w-[32rem]">{t('deviceOnly')}</p>
              <button type="button" className="btn-ghost text-danger" onClick={() => setConfirmClear(true)}>
                <Trash2 className="size-4" aria-hidden="true" />
                {t('clearAll')}
              </button>
            </div>
            <ConfirmDialog
              open={confirmClear}
              onOpenChange={setConfirmClear}
              title={t('clearTitle')}
              description={t('clearBody')}
              confirmLabel={t('clearConfirm')}
              tone="danger"
              onConfirm={() => {
                clear();
                toast(t('clearedToast'));
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
