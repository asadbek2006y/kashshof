'use client';

import { Flag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Notice } from '@/components/ui/notice';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/cn';

export const REPORT_REASONS = ['INCORRECT_DETAILS', 'BROKEN_CONTACT', 'OUTDATED', 'NOT_OPERATING', 'OTHER'] as const;
type Reason = (typeof REPORT_REASONS)[number];
const DETAILS_MAX = 1000;

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; tooMany: boolean };

/**
 * "This information is wrong": files a report for a person to review. The report never changes the
 * data by itself, and the form asks for nothing that identifies the sender.
 */
export function ReportButton({
  orgSlug,
  programId,
  variant = 'quiet',
  className,
}: {
  orgSlug: string;
  programId?: string;
  variant?: 'quiet' | 'button';
  className?: string;
}) {
  const t = useTranslations('report');
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const detailsId = useId();
  const hintId = useId();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // A fresh form each time, unless a send is still in flight.
    if (!next && state.kind !== 'sending') {
      setReason(null);
      setDetails('');
      setState({ kind: 'idle' });
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reason) return;
    setState({ kind: 'sending' });
    const { data, response } = await api.POST('/api/v1/reports', {
      body: { orgSlug, programId, reason, details: details.trim() || undefined },
    });
    setState(data ? { kind: 'sent' } : { kind: 'error', tooMany: response.status === 429 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        className={cn(variant === 'button' ? 'btn-ghost' : 'action-quiet mt-1', className)}
        data-testid="report-open"
      >
        <Flag className="size-4 shrink-0" aria-hidden="true" />
        {t('open')}
      </DialogTrigger>
      <DialogContent title={t('title')} description={t('lead')} variant="sheet">
        {state.kind === 'sent' ? (
          <div className="space-y-4" data-testid="report-sent">
            <Notice role="status" title={t('sentTitle')}>
              {t('sentBody')}
            </Notice>
            <button type="button" className="btn-secondary w-full" onClick={() => onOpenChange(false)}>
              {t('done')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" data-testid="report-form">
            <fieldset>
              <legend className="label mb-2">{t('reasonLabel')}</legend>
              <div className="grid gap-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="choice w-full cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="size-4 shrink-0 accent-[var(--color-primary)]"
                      required
                    />
                    <span>{t(`reason.${r}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={detailsId} className="label">
                {t('detailsLabel')} <span className="font-normal text-ink-3">({t('optional')})</span>
              </label>
              <textarea
                id={detailsId}
                aria-describedby={hintId}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={DETAILS_MAX}
                rows={4}
                className="field mt-1.5 resize-y"
                placeholder={t('detailsPlaceholder')}
              />
              <p id={hintId} className="meta mt-1.5 text-[14px]">
                {t('privacy')}
              </p>
            </div>

            {state.kind === 'error' && (
              <Notice tone="warn" role="alert">
                {state.tooMany ? t('tooMany') : t('error')}
              </Notice>
            )}

            <button type="submit" className="btn-primary w-full" disabled={!reason || state.kind === 'sending'} data-testid="report-submit">
              {state.kind === 'sending' ? t('sending') : t('submit')}
            </button>
            <p className="meta text-[14px]">{t('reviewNote')}</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
