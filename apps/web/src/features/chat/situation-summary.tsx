'use client';

import { useTranslations } from 'next-intl';
import type { SupportProfile } from '@/lib/api/client';
import { useVocab } from '@/lib/use-vocab';

// Never echo these back on screen — someone else may be looking at it.
const HIDDEN = new Set(['survivor', 'has_children']);

/** Human-readable facts and needs from a profile, shared by the summary panel and results header. */
export function useSituationFacts(profile: SupportProfile) {
  const t = useTranslations('summary');
  const vocab = useVocab();

  const facts: string[] = [];
  for (const c of profile.circumstances) if (!HIDDEN.has(c)) facts.push(vocab.situation(c));
  if (profile.ageMin !== undefined && profile.ageMax !== undefined) {
    facts.push(
      profile.ageMin === profile.ageMax
        ? t('age', { age: profile.ageMin })
        : t('ageRange', { range: profile.ageMax >= 99 ? `${profile.ageMin}+` : `${profile.ageMin}–${profile.ageMax}` }),
    );
  }
  if (profile.region) facts.push(vocab.region(profile.region));
  if (profile.childrenCount) facts.push(t('children', { count: profile.childrenCount }));
  const needs = profile.needs.filter((n) => n !== 'safety').map(vocab.need);
  return { facts, needs };
}

/** "What I understood" — the structured facts matching will use, visible and correctable. */
export function SituationSummary({ profile }: { profile: SupportProfile }) {
  const t = useTranslations('summary');
  const { facts, needs } = useSituationFacts(profile);
  if (facts.length === 0 && needs.length === 0) return null;
  return (
    <section data-testid="situation-summary" aria-labelledby="summary-title">
      {/* Phones: one quiet line, so the conversation stays in view. */}
      <p className="meta rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 lg:hidden">
        <span className="font-semibold text-ink">{t('title')}:</span> {[...needs, ...facts].join(' · ')}
      </p>
      {/* Desktop: a side panel. */}
      <div className="card hidden p-5 lg:block">
        <h2 id="summary-title" className="text-[16px] font-semibold text-ink">
          {t('title')}
        </h2>
        <p className="meta mt-1 text-[14px]">{t('lead')}</p>
        {needs.length > 0 && (
          <>
            <p className="label mt-4">{t('lookingFor')}</p>
            <ul className="mt-1 space-y-0.5 text-[15px] text-ink">
              {needs.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        )}
        {facts.length > 0 && (
          <>
            <p className="label mt-4">{t('aboutYou')}</p>
            <ul className="mt-1 space-y-0.5 text-[15px] text-ink">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
