'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Copy, Printer } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ApplicationSteps } from '@/components/hamroh/application-step';
import { DocumentChecklist } from '@/components/hamroh/document-checklist';
import { MatchBadge } from '@/components/hamroh/match-badge';
import { MatchReasonList } from '@/components/hamroh/match-reason-list';
import { ProgramSource } from '@/components/hamroh/program-source';
import { Notice } from '@/components/ui/notice';
import { useConversation } from '@/features/chat/conversation-store';
import { Link } from '@/i18n/navigation';
import type { ProgramDetail } from '@/lib/api/client';
import { pick } from '@/lib/localized';
import { LIMITS, statementSchema, type StatementInput } from './statement-schema';

const STEPS = ['requirements', 'documents', 'statement', 'apply'] as const;

/**
 * Prepare — never submit. Kashshof helps someone get ready (conditions, documents, a draft
 * statement) and then points to the official place to apply. Nothing leaves the browser, and
 * the last step says so in plain words.
 */
export function PrepareApplication({ program, eligibility }: { program: ProgramDetail; eligibility: string[] }) {
  const t = useTranslations('apply');
  const locale = useLocale();
  const { conversation } = useConversation();
  const match = conversation.matches[program.id];
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState<string[]>([]);
  const [statement, setStatement] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const title = pick(program.title, locale);

  const form = useForm<StatementInput>({
    resolver: zodResolver(statementSchema),
    defaultValues: { name: '', reason: '', family: '', background: '' },
  });
  const errors = form.formState.errors;

  // Move focus to the new step's heading so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const draft = form.handleSubmit((values) => {
    setStatement(
      t('template', {
        name: values.name || t('templateNameFallback'),
        program: title,
        org: program.organization.name,
        reason: values.reason,
        family: values.family || t('templateFamilyFallback'),
        background: values.background || t('templateBackgroundFallback'),
      }),
    );
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(statement);
      toast(t('copied'));
    } catch {
      toast(t('copyFailed'));
    }
  };

  const fieldError = (name: keyof StatementInput) => {
    const message = errors[name]?.message;
    return message ? (
      <p id={`${name}-error`} className="mt-1.5 text-[14px] font-medium text-danger">
        {t(`errors.${message as 'reasonRequired' | 'answerTooLong' | 'nameTooLong'}`)}
      </p>
    ) : null;
  };

  return (
    <div className="mx-auto max-w-[46rem]">
      <header className="pb-6">
        <p className="kicker">{t('eyebrow')}</p>
        <h1 className="title-page mt-3">{title}</h1>
        <p className="meta mt-2">{program.organization.name}</p>
        <Notice className="mt-5" title={t('notSubmittingTitle')}>
          {t('notSubmittingBody')}
        </Notice>
      </header>

      <div data-print="hide">
        <ApplicationSteps steps={STEPS.map((s) => t(`steps.${s}`))} current={step} onSelect={setStep} label={t('stepsLabel')} />
      </div>

      <section className="mt-8" aria-labelledby="step-title">
        <h2 id="step-title" ref={headingRef} tabIndex={-1} className="title-section outline-none">
          <span className="text-ink-3">{t('stepOf', { current: step + 1, total: STEPS.length })} · </span>
          {t(`steps.${STEPS[step]}`)}
        </h2>

        {step === 0 && (
          <div className="mt-5 space-y-5">
            <p className="text-[16px] text-ink">{t('requirementsLead')}</p>
            <ul className="list-disc space-y-1.5 pl-5 marker:text-ink-3">
              {eligibility.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {match && (
              <div className="card space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <MatchBadge fit={match.fit} />
                  <span className="meta">{t('fromYourAnswers')}</span>
                </div>
                <MatchReasonList reasons={match.reasons} />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-4">
            {program.requiredDocuments.length === 0 ? (
              <p className="text-ink-2">{t('noDocuments')}</p>
            ) : (
              <>
                <p className="text-[16px] text-ink">{t('documentsLead')}</p>
                <DocumentChecklist documents={program.requiredDocuments} checked={ready} onChange={setReady} testId="apply-documents" />
                <p className="meta">{t('documentsPrivate')}</p>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="mt-5">
            <p className="text-[16px] text-ink">{t('statementLead')}</p>
            <form className="mt-5 space-y-5" onSubmit={draft} noValidate data-print="hide">
              {(['name', 'reason', 'family', 'background'] as const).map((name) => (
                <div key={name}>
                  <label htmlFor={`field-${name}`} className="mb-1.5 block text-[16px] font-medium text-ink">
                    {t(`fields.${name}`)}
                    {name === 'reason' ? <span className="text-danger"> *</span> : <span className="meta font-normal"> · {t('optional')}</span>}
                  </label>
                  {name === 'name' ? (
                    <input
                      id={`field-${name}`}
                      className="field"
                      maxLength={LIMITS.name}
                      autoComplete="off"
                      aria-invalid={Boolean(errors[name])}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      {...form.register(name)}
                    />
                  ) : (
                    <textarea
                      id={`field-${name}`}
                      rows={2}
                      maxLength={LIMITS.answer}
                      placeholder={t(`fields.${name}Hint`)}
                      className="field resize-y"
                      aria-invalid={Boolean(errors[name])}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      aria-required={name === 'reason'}
                      {...form.register(name)}
                    />
                  )}
                  {fieldError(name)}
                </div>
              ))}
              <button type="submit" className="btn-secondary" data-testid="draft-statement">
                {statement ? t('redraft') : t('draft')}
              </button>
            </form>

            {statement && (
              <div className="mt-8">
                <label htmlFor="statement" className="mb-1.5 block text-[16px] font-semibold text-ink">
                  {t('yourStatement')}
                </label>
                <textarea
                  id="statement"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={12}
                  maxLength={LIMITS.statement}
                  className="field text-[16px] leading-relaxed"
                  data-testid="statement"
                />
                <p className="meta mt-2">{t('statementEditable')}</p>
                <div className="mt-3 flex flex-wrap gap-3" data-print="hide">
                  <button type="button" className="btn-secondary" onClick={() => void copy()}>
                    <Copy className="size-4" aria-hidden="true" />
                    {t('copy')}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => window.print()}>
                    <Printer className="size-4" aria-hidden="true" />
                    {t('print')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 space-y-5" data-testid="apply-final">
            <Notice tone="warn" role="status" title={t('nothingSubmitted')}>
              {t('nothingSubmittedBody', { org: program.organization.name })}
            </Notice>
            <ol className="space-y-3">
              {[t('final.review'), program.sourceUrl ? t('final.official') : t('final.contact', { org: program.organization.name }), t('final.bring')].map(
                (line, i) => (
                  <li key={line} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[16px]">{line}</span>
                  </li>
                ),
              )}
            </ol>
            <div className="flex flex-wrap gap-3">
              {program.sourceUrl ? (
                <ProgramSource url={program.sourceUrl} variant="button" />
              ) : (
                <Link href={`/organizations/${program.organization.slug}`} className="btn-secondary">
                  {t('orgPage')}
                </Link>
              )}
              <button type="button" className="btn-secondary" onClick={() => window.print()} data-print="hide">
                <Printer className="size-4" aria-hidden="true" />
                {t('printSummary')}
              </button>
            </div>
            {program.requiredDocuments.length > 0 && (
              <p className="meta">{t('documentsReady', { done: ready.length, total: program.requiredDocuments.length })}</p>
            )}
          </div>
        )}
      </section>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-5" data-print="hide">
        {step > 0 ? (
          <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('back')}
          </button>
        ) : (
          <Link href={`/programs/${program.id}`} className="btn-ghost">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('backToProgram')}
          </Link>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" className="btn-primary" onClick={() => setStep(step + 1)} data-testid="next-step-button">
            {t('next')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
