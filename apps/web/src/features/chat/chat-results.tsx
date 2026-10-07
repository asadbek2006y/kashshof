'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MatchCard } from '@/components/hamroh/match-card';
import { Link } from '@/i18n/navigation';
import type { MatchResult } from '@/lib/api/client';
import { stagger } from '@/lib/motion';

/** The first few explained matches inside the conversation, then the full results page. */
export function ChatResults({ results }: { results: MatchResult[] }) {
  const t = useTranslations('ask');
  return (
    <div data-testid="chat-results">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4">
        {results.slice(0, 3).map((match, i) => (
          <MatchCard key={match.program.id} match={match} compact defaultOpen={i === 0} />
        ))}
      </motion.div>
      <Link href="/results" className="btn-secondary mt-4 w-full sm:w-auto" data-testid="see-all-results">
        {t('seeAll')}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
