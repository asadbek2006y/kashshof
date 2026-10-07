'use client';

import { ArrowRight, BookOpen, MessageCircle, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MatchCard } from '@/components/hamroh/match-card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { hasSafetyConcern, useConversation } from '@/features/chat/conversation-store';
import { ConversationProgress } from '@/features/chat/conversation-progress';
import { useSituationFacts } from '@/features/chat/situation-summary';
import { SafetyPanel } from '@/features/safety/safety-panel';
import { Link } from '@/i18n/navigation';
import { api, type MatchResult, type SupportProfile } from '@/lib/api/client';
import { stagger } from '@/lib/motion';
import { FitLegend } from './fit-legend';
import { MatchingProgress } from './matching-progress';

type Filters = { onlyOpen?: boolean; womenOnly?: boolean };
type Load = { status: 'loading' } | { status: 'error' } | { status: 'done'; results: MatchResult[] };

function BasedOn({ profile }: { profile: SupportProfile }) {
  const t = useTranslations('results');
  const { facts, needs } = useSituationFacts(profile);
  const items = [...needs, ...facts];
  if (items.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="meta">
        <span className="font-semibold text-ink">{t('basedOn')}</span> {items.join(' · ')}
      </p>
      <Link href="/ask" className="action-quiet text-primary">
        <Pencil className="size-3.5" aria-hidden="true" />
        {t('changeAnswers')}
      </Link>
    </div>
  );
}

export function ResultsView() {
  const t = useTranslations('results');
  const { conversation, recordMatches } = useConversation();
  const profile = conversation.state?.profile;
  const safetyMode = hasSafetyConcern(conversation);
  const [filters, setFilters] = useState<Filters>(conversation.state?.filters ?? {});
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new request starts in the loading state
    setLoad({ status: 'loading' });
    api
      .POST('/api/v1/matches', { body: { profile, filters } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) return setLoad({ status: 'error' });
        setLoad({ status: 'done', results: data });
        recordMatches(data);
      })
      .catch(() => !cancelled && setLoad({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [profile, filters, attempt, recordMatches]);

  if (!profile) {
    return (
      <div className="page max-w-[46rem] pt-10 sm:pt-14">
        <h1 className="title-page">{t('emptyTitle')}</h1>
        <p className="lead mt-3">{t('emptyLead')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/ask" className="btn-primary">
            <MessageCircle className="size-4" aria-hidden="true" />
            {t('emptyCta')}
          </Link>
          <Link href="/explore" className="btn-secondary">
            <BookOpen className="size-4" aria-hidden="true" />
            {t('browseAll')}
          </Link>
        </div>
        <p className="meta mt-4">{t('emptyPrivacy')}</p>
      </div>
    );
  }

  const toggle = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: !f[key] }));
  const filtered = Boolean(filters.onlyOpen || filters.womenOnly);
  const results = load.status === 'done' ? load.results : null;

  return (
    <div className="page pt-6 sm:pt-10">
      <div className="max-w-[50rem]">
        {!safetyMode && <ConversationProgress current={3} />}
        {safetyMode && <SafetyPanel className="mt-6" />}

        <header className="pt-6 pb-5">
          <h1 className="title-page" aria-live="polite">
            {results ? t('title', { count: results.length }) : t('loadingTitle')}
          </h1>
          <p className="lead mt-3">{t('lead')}</p>
          {!safetyMode && <BasedOn profile={profile} />}
        </header>

        <FitLegend />

        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label={t('filters')}>
          <span className="label mr-1">{t('filtersLabel')}</span>
          <button type="button" className="choice min-h-11 text-[15px]" aria-pressed={Boolean(filters.onlyOpen)} onClick={() => toggle('onlyOpen')}>
            {t('onlyOpen')}
          </button>
          <button type="button" className="choice min-h-11 text-[15px]" aria-pressed={Boolean(filters.womenOnly)} onClick={() => toggle('womenOnly')}>
            {t('womenOnly')}
          </button>
        </div>

        <div className="mt-6" data-testid="results-list">
          {load.status === 'loading' && (
            <div className="grid gap-4">
              <MatchingProgress />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}

          {load.status === 'error' && (
            <ErrorState title={t('errorTitle')} body={t('errorBody')} retryLabel={t('retry')} onRetry={() => setAttempt((a) => a + 1)} />
          )}

          {results && results.length === 0 && (
            <EmptyState
              title={t('noneTitle')}
              body={
                <>
                  <p>{t('noneBody')}</p>
                  {filtered && <p className="mt-2">{t('noneFiltered')}</p>}
                </>
              }
              actions={
                <>
                  {filtered && (
                    <button type="button" className="btn-primary" onClick={() => setFilters({})}>
                      {t('clearFilters')}
                    </button>
                  )}
                  <Link href="/ask" className={filtered ? 'btn-secondary' : 'btn-primary'}>
                    {t('changeAnswers')}
                  </Link>
                  <Link href="/explore" className="btn-secondary">
                    {t('browseAll')}
                  </Link>
                  <Link href="/safety" className="btn-ghost text-danger">
                    {t('urgentHelp')}
                  </Link>
                </>
              }
            />
          )}

          {results && results.length > 0 && (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4">
              {results.map((match, i) => (
                <MatchCard key={match.program.id} match={match} headingLevel={2} defaultOpen={i < 3} />
              ))}
            </motion.div>
          )}
        </div>

        <aside className="mt-8 rounded-[var(--radius-md)] border border-line bg-surface p-5">
          <h2 className="text-[16px] font-semibold text-ink">{t('notDecisionTitle')}</h2>
          <p className="meta mt-1">{t('notDecisionBody')}</p>
          <Link href="/how-it-works" className="action mt-1">
            {t('howWeMatch')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
