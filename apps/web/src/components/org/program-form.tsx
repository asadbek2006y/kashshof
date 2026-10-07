'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import { Notice } from '@/components/ui/notice';
import { useRouter } from '@/i18n/navigation';
import { api, type OrganizationDetail, type Schemas } from '@/lib/api/client';
import { DOCUMENTS, REGIONS, SUPPORT_TYPES } from '@/lib/vocab';
import { useVocab } from '@/lib/use-vocab';

type Body = Schemas['CreateProgramDto'];

function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-t border-line pt-6 pb-8 sm:grid-cols-[12rem_1fr] sm:gap-8">
      <legend className="sr-only">{legend}</legend>
      <div aria-hidden="true">
        <p className="text-[20px] leading-snug font-medium">{legend}</p>
        {hint && <p className="meta mt-1">{hint}</p>}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </fieldset>
  );
}

function Checks<T extends string>({
  values,
  selected,
  label,
  onChange,
}: {
  values: readonly T[];
  selected: T[];
  label: (v: T) => string;
  onChange: (next: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => {
        const on = selected.includes(v);
        return (
          <button key={v} type="button" className="choice" aria-pressed={on} onClick={() => onChange(on ? selected.filter((s) => s !== v) : [...selected, v])}>
            {label(v)}
          </button>
        );
      })}
    </div>
  );
}

const INPUT = 'field';

/**
 * Structured program entry. Every field here is a value the matching engine searches, which is
 * why eligibility is chips and ranges rather than free text.
 */
export function ProgramForm() {
  const t = useTranslations('orgForm');
  const locale = useLocale();
  const router = useRouter();
  const vocab = useVocab();
  const [orgs, setOrgs] = useState<OrganizationDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Body>({
    orgSlug: '',
    locale: locale as Body['locale'],
    title: '',
    summary: '',
    supportTypes: [],
    genders: ['female'],
    regions: [],
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
  });

  useEffect(() => {
    void api.GET('/api/v1/organizations').then(({ data }) => {
      setOrgs(data ?? []);
      if (data?.[0]) setForm((f) => (f.orgSlug ? f : { ...f, orgSlug: data[0].slug }));
    });
  }, []);

  const set = <K extends keyof Body>(key: K, value: Body[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError(null);
    if (form.supportTypes.length === 0) {
      setError(t('errorSupport'));
      return;
    }
    setSaving(true);
    const { data, error: e } = await api.POST('/api/v1/org/programs', {
      body: { ...form, deadline: form.deadline || undefined },
    });
    setSaving(false);
    if (e || !data) {
      const message = (e as { message?: string | string[] } | undefined)?.message;
      setError(Array.isArray(message) ? message.join(', ') : (message ?? t('errorGeneric')));
      return;
    }
    router.push({ pathname: '/org', query: { created: data.id } });
  };

  return (
    <form
      className="page max-w-[56rem]"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <header className="pt-10 pb-8 sm:pt-14">
        <p className="kicker">{t('eyebrow')}</p>
        <h1 className="title-page mt-3">{t('title')}</h1>
        <p className="lead mt-3">{t('lead')}</p>
      </header>

      <Fieldset legend={t('basics')}>
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-medium">{t('organization')}</span>
          <select className={INPUT} value={form.orgSlug} onChange={(e) => set('orgSlug', e.target.value)} required>
            {orgs.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-medium">{t('programName')}</span>
          <input className={INPUT} value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength={120} name="title" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-medium">{t('description')}</span>
          <textarea className={INPUT} rows={4} value={form.summary} onChange={(e) => set('summary', e.target.value)} required maxLength={1000} name="summary" />
        </label>
        <p className="meta">{t('writtenIn', { language: t(`languages.${form.locale}`) })}</p>
      </Fieldset>

      <Fieldset legend={t('support')} hint={t('supportHint')}>
        <Checks values={SUPPORT_TYPES} selected={form.supportTypes} label={vocab.need} onChange={(v) => set('supportTypes', v)} />
      </Fieldset>

      <Fieldset legend={t('whoCanApply')}>
        <div>
          <p className="mb-2 text-[15px] font-medium">{t('gender')}</p>
          <Checks values={['female', 'male'] as const} selected={form.genders} label={(g) => t(`genders.${g}`)} onChange={(v) => set('genders', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-1.5 block text-[15px] font-medium">{t('ageMin')}</span>
            <input type="number" min={0} max={120} className={INPUT} value={form.ageMin ?? ''} onChange={(e) => set('ageMin', e.target.value ? Number(e.target.value) : undefined)} />
          </label>
          <label>
            <span className="mb-1.5 block text-[15px] font-medium">{t('ageMax')}</span>
            <input type="number" min={0} max={120} className={INPUT} value={form.ageMax ?? ''} onChange={(e) => set('ageMax', e.target.value ? Number(e.target.value) : undefined)} />
          </label>
        </div>
        <div>
          <p className="mb-2 text-[15px] font-medium">{t('regions')}</p>
          <p className="meta -mt-1 mb-2">{t('regionsHint')}</p>
          <Checks values={REGIONS} selected={form.regions} label={vocab.region} onChange={(v) => set('regions', v)} />
        </div>
      </Fieldset>

      <Fieldset legend={t('documents')}>
        <Checks values={DOCUMENTS} selected={form.requiredDocuments} label={vocab.document} onChange={(v) => set('requiredDocuments', v)} />
      </Fieldset>

      <Fieldset legend={t('application')}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('application')}>
          {(['OPEN', 'CLOSED'] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={form.applicationStatus === s} className="choice" onClick={() => set('applicationStatus', s)}>
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-medium">{t('deadline')}</span>
          <input type="date" className={INPUT} value={form.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || undefined)} />
        </label>
      </Fieldset>

      <div className="space-y-5 border-t border-line pt-6">
        {error && <Notice tone="warn">{error}</Notice>}
        <Notice>{t('draftNote')}</Notice>
        <button type="submit" className="btn-primary" disabled={saving || !form.orgSlug} data-testid="org-submit">
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
}
