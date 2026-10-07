'use client';

import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { MatchResult } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { pick } from '@/lib/localized';
import { collapse, fadeUp } from '@/lib/motion';
import { reviewStatus } from '@/lib/review-status';
import { toSaved } from '@/lib/saved';
import { useVocab } from '@/lib/use-vocab';
import { MatchBadge } from './match-badge';
import { MatchReasonList } from './match-reason-list';
import { NextStepLine } from './next-step';
import { ProgramSource } from './program-source';
import { ProgramStatus } from './program-status';
import { SaveButton } from './save-button';
import { VerificationStatus } from './verification-status';

/**
 * One explained result. Answers, in order: what is it, how well might it fit (the matcher's
 * label), why it appeared (✓ ? !), what to do next, and where the information comes from.
 */
export function MatchCard({
  match,
  compact = false,
  defaultOpen = true,
  headingLevel = 3,
}: {
  match: MatchResult;
  compact?: boolean;
  defaultOpen?: boolean;
  headingLevel?: 2 | 3;
}) {
  const t = useTranslations('match');
  const tFit = useTranslations('fitHelp');
  const locale = useLocale();
  const vocab = useVocab();
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const { program } = match;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <motion.article variants={fadeUp} className="card min-w-0 p-5 break-words sm:p-6" data-testid="match-card" data-fit={match.fit} data-program={program.id}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="kicker min-w-0 pt-1 break-words">{program.organization.name}</p>
        <MatchBadge fit={match.fit} />
      </div>

      <Heading className="title-item mt-2">
        <Link href={`/programs/${program.id}`} className="rounded-[4px] hover:underline hover:underline-offset-4">
          {pick(program.title, locale)}
        </Link>
      </Heading>
      <p className="meta mt-1">{program.supportTypes.slice(0, 3).map(vocab.need).join(' · ')}</p>
      {!compact && <p className="mt-3 max-w-[64ch] text-[16px] text-ink">{pick(program.summary, locale)}</p>}
      <p className="mt-3 text-[14px] leading-snug text-ink-2">{tFit(match.fit)}</p>

      <div className="mt-4 border-t border-line pt-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-[16px] font-semibold text-ink"
        >
          {t('whyAppeared')}
          <ChevronDown className={cn('size-5 shrink-0 text-ink-2 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="reasons"
              id={panelId}
              variants={collapse}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              className="overflow-hidden"
            >
              <MatchReasonList reasons={match.reasons} className="pt-2 pb-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NextStepLine match={match} className="mt-4" />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href={`/programs/${program.id}`} className="action" data-testid="view-details">
          {t('viewDetails')}
        </Link>
        <ProgramSource url={program.sourceUrl} />
        <SaveButton program={toSaved(program)} />
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-t border-line pt-3">
        <ProgramStatus program={program} />
        <VerificationStatus status={reviewStatus(program)} />
      </div>
    </motion.article>
  );
}
