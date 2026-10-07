'use client';

import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { ProgramSummary } from '@/lib/api/client';
import { listFormat } from '@/lib/dates';
import { pick } from '@/lib/localized';
import { fadeUp } from '@/lib/motion';
import { reviewStatus } from '@/lib/review-status';
import { toSaved } from '@/lib/saved';
import { useVocab } from '@/lib/use-vocab';
import { ProgramSource } from './program-source';
import { ProgramStatus } from './program-status';
import { SaveButton } from './save-button';
import { VerificationStatus } from './verification-status';

/** A program without match context (browsing): what it is, where, status, source. */
export function ProgramCard({
  program,
  showOrg = true,
  headingLevel = 3,
}: {
  program: ProgramSummary;
  showOrg?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const locale = useLocale();
  const vocab = useVocab();
  const t = useTranslations('match');
  const tProgram = useTranslations('program');
  const where =
    program.regions.length === 0
      ? tProgram('eligibility.nationwide')
      : listFormat(locale, program.regions.slice(0, 3).map(vocab.region)) + (program.regions.length > 3 ? ` +${program.regions.length - 3}` : '');

  return (
    <motion.article variants={fadeUp} className="card min-w-0 p-5 break-words sm:p-6" data-testid="program-card" data-program={program.id}>
      {showOrg && <p className="kicker mb-2 break-words">{program.organization.name}</p>}
      <Heading className="title-item">
        <Link href={`/programs/${program.id}`} className="rounded-[4px] hover:underline hover:underline-offset-4">
          {pick(program.title, locale)}
        </Link>
      </Heading>
      <p className="meta mt-1">{program.supportTypes.slice(0, 3).map(vocab.need).join(' · ')}</p>
      <p className="mt-3 line-clamp-3 max-w-[64ch] text-[16px] text-ink">{pick(program.summary, locale)}</p>
      <p className="meta mt-2 flex items-center gap-1.5">
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        {where}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href={`/programs/${program.id}`} className="action">
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
