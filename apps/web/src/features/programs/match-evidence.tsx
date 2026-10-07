'use client';

import { ArrowRight, CircleAlert, CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MatchBadge } from '@/components/hamroh/match-badge';
import { MatchReasonList } from '@/components/hamroh/match-reason-list';
import { NextStepLine } from '@/components/hamroh/next-step';
import { useConversation } from '@/features/chat/conversation-store';
import { Link } from '@/i18n/navigation';
import { ProgramSection } from './program-section';

/**
 * The three person-specific sections of a program page. With a match from this session (held in
 * memory only), they show the matcher's own reasons; otherwise they show the program's general
 * conditions and an invitation to check.
 */
export function MatchEvidence({
  programId,
  generalConfirm,
  generalIneligible,
}: {
  programId: string;
  generalConfirm: string[];
  generalIneligible: string[];
}) {
  const t = useTranslations('program');
  const { conversation } = useConversation();
  const match = conversation.matches[programId];

  const unknown = match?.reasons.filter((r) => r.kind === 'unknown') ?? [];
  const risks = match?.reasons.filter((r) => r.kind === 'risk') ?? [];

  return (
    <>
      <ProgramSection id="why" title={t('whyMatched')}>
        {match ? (
          <div className="space-y-4" data-testid="match-evidence">
            <div className="flex flex-wrap items-center gap-3">
              <MatchBadge fit={match.fit} />
              <span className="meta">{t('basedOnAnswers')}</span>
            </div>
            <MatchReasonList reasons={match.reasons} only={['yes']} />
            <NextStepLine match={match} />
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-line-strong px-4 py-4">
            <p className="text-ink-2">{t('noMatchYet')}</p>
            <Link href="/ask" className="action mt-1">
              {t('checkFit')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </ProgramSection>

      <ProgramSection id="confirm" title={t('toConfirm')}>
        {match ? (
          unknown.length > 0 ? (
            <MatchReasonList reasons={unknown} only={['unknown']} />
          ) : (
            <p className="text-ink-2">{t('nothingToConfirm')}</p>
          )
        ) : (
          <IconList items={generalConfirm} icon="unknown" empty={t('nothingToConfirm')} />
        )}
      </ProgramSection>

      <ProgramSection id="ineligible" title={t('mightNotQualify')}>
        {match ? (
          risks.length > 0 ? (
            <MatchReasonList reasons={risks} only={['risk']} />
          ) : (
            <p className="text-ink-2">{t('noKnownBlockers')}</p>
          )
        ) : (
          <IconList items={generalIneligible} icon="risk" empty={t('noKnownBlockers')} />
        )}
      </ProgramSection>
    </>
  );
}

function IconList({ items, icon, empty }: { items: string[]; icon: 'unknown' | 'risk'; empty: string }) {
  if (items.length === 0) return <p className="text-ink-2">{empty}</p>;
  const Icon = icon === 'unknown' ? CircleHelp : CircleAlert;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[16px] leading-snug">
          <Icon className={`mt-[2px] size-[18px] shrink-0 ${icon === 'unknown' ? 'text-warning' : 'text-danger'}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
