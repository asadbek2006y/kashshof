'use client';

import { ArrowRight, LifeBuoy, RotateCcw } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AIProviderNotice } from '@/components/hamroh/ai-provider-notice';
import { PrivacyNotice } from '@/components/hamroh/privacy-notice';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Notice } from '@/components/ui/notice';
import { ErrorState } from '@/components/ui/states';
import { SafetyPanel } from '@/features/safety/safety-panel';
import { Link } from '@/i18n/navigation';
import { hasSafetyConcern, type AssistantMode } from './conversation-store';
import { ConversationComposer } from './conversation-composer';
import { ConversationProgress, type Stage } from './conversation-progress';
import { AssistantBubble, UserBubble } from './conversation-message';
import { ChatResults } from './chat-results';
import { ModeChooser } from './mode-chooser';
import { SituationSummary } from './situation-summary';
import { SuggestedAnswerChips } from './suggested-answer-chips';
import { useAiAvailable, useAssistant, type TurnInput } from './use-assistant';

export function Chat() {
  const assistant = useAssistant();
  const aiAvailable = useAiAvailable();
  const { conversation, takeHandoff, send, busy } = assistant;
  const [choice, setChoice] = useState<AssistantMode>(conversation.mode ?? 'private');
  const handled = useRef(false);

  // A demo situation or topic handed over from another page (in memory, never the URL).
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const handoff = takeHandoff();
    if (!handoff) return;
    const mode = handoff.mode ?? 'private';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- applying a one-time handoff after mount
    setChoice(mode);
    void send(handoff.text ? { text: handoff.text } : null, mode);
  }, [takeHandoff, send]);

  const started = conversation.transcript.length > 0 || busy;
  if (!started) {
    return (
      <StartScreen
        choice={choice}
        onChoice={setChoice}
        aiAvailable={aiAvailable}
        onStart={(input) => void send(input, aiAvailable ? choice : 'private')}
      />
    );
  }
  return <Conversation assistant={assistant} aiAvailable={aiAvailable} />;
}

function StartScreen({
  choice,
  onChoice,
  aiAvailable,
  onStart,
}: {
  choice: AssistantMode;
  onChoice: (mode: AssistantMode) => void;
  aiAvailable: boolean | undefined;
  onStart: (input: TurnInput | null) => void;
}) {
  const t = useTranslations('ask');
  return (
    <div className="page pt-6 sm:pt-10">
      <div className="mx-auto max-w-[46rem]">
        <ConversationProgress current={0} />
        <h1 className="title-page mt-6">{t('startTitle')}</h1>
        <p className="lead mt-3">{t('startLead')}</p>

        <PrivacyNotice className="mt-6" />

        <div className="mt-6">
          <ModeChooser value={choice} onChange={onChoice} aiAvailable={aiAvailable} />
        </div>

        <ConversationComposer
          className="mt-8"
          rows={4}
          label={t('storyLabel')}
          placeholder={t('storyPlaceholder')}
          submitLabel={t('startButton')}
          onSend={(text) => onStart({ text })}
          footer={<p className="meta mt-2 text-[14px]">{t('storyHint')}</p>}
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5">
          <p className="text-[15px] text-ink-2">{t('stepByStepLead')}</p>
          <button type="button" className="action" onClick={() => onStart(null)} data-testid="step-by-step">
            {t('stepByStep')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-6 flex items-start gap-2 text-[15px] text-ink-2">
          <LifeBuoy className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
          <span>
            {t('dangerLead')}{' '}
            <Link href="/safety" className="font-semibold text-danger underline underline-offset-4">
              {t('dangerLink')}
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}

function Conversation({ assistant, aiAvailable }: { assistant: ReturnType<typeof useAssistant>; aiAvailable: boolean | undefined }) {
  const t = useTranslations('ask');
  const tModes = useTranslations('modes');
  const reduceMotion = useReducedMotion();
  const { conversation, send, busy, failed, retry, reset, switchMode } = assistant;
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [confirmAi, setConfirmAi] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const mode = conversation.mode ?? 'private';
  const state = conversation.state;
  const safetyMode = hasSafetyConcern(conversation);
  const awaitingSafetyChoice = state?.mode === 'safety';
  const stage: Stage = state?.mode === 'results' ? 2 : (state?.profile.needs.length ?? 0) > 0 ? 1 : 0;
  const allResults = conversation.transcript.flatMap((e) => (e.role === 'results' ? e.results : []));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
  }, [conversation.transcript.length, busy, reduceMotion]);

  // When the chip someone pressed disappears, keep their focus in the conversation.
  useEffect(() => {
    if (!busy && document.activeElement === document.body) {
      document.querySelector<HTMLTextAreaElement>('[data-testid="chat-input"]')?.focus({ preventScroll: true });
    }
  }, [busy]);

  const answer = (input: TurnInput) => void send(input);

  return (
    <div className="page pt-5 sm:pt-8">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-4">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold text-ink sm:text-[22px]">{t('title')}</h1>
          {!safetyMode && <ConversationProgress current={stage} className="mt-2" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-4">
          {aiAvailable && (
            <button
              type="button"
              className="action-quiet"
              onClick={() => (mode === 'ai' ? switchMode('private') : setConfirmAi(true))}
              data-testid="switch-mode"
            >
              {mode === 'ai' ? tModes('switchToPrivate') : tModes('switchToAi')}
            </button>
          )}
          <button type="button" onClick={() => setConfirmRestart(true)} className="action-quiet" data-testid="start-over">
            <RotateCcw className="size-4" aria-hidden="true" />
            {t('startOver')}
          </button>
        </div>
      </header>

      {safetyMode && <SafetyPanel className="mt-6" />}

      <div className="mt-6 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <aside className="mb-5 lg:order-last lg:mb-0">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* In safety mode nothing about the person is echoed on screen — someone may be watching. */}
            {state && !safetyMode && <SituationSummary profile={state.profile} />}
          </div>
        </aside>

        <div className="min-w-0 max-w-[46rem]">
          <div role="log" aria-label={t('transcriptLabel')} aria-live="polite" aria-relevant="additions">
            <ol className="flex flex-col gap-6" data-testid="transcript">
              {conversation.transcript.map((entry, i) => {
                const previous = conversation.transcript[i - 1];
                if (entry.role === 'user') return <UserBubble key={entry.id} text={entry.text} />;
                if (entry.role === 'notice') {
                  return (
                    <li key={entry.id}>
                      <Notice tone="warn" role="status" title={t('aiFallbackTitle')}>
                        {t('aiFallbackBody')}
                      </Notice>
                    </li>
                  );
                }
                if (entry.role === 'assistant') {
                  return (
                    <AssistantBubble
                      key={entry.id}
                      message={entry.message}
                      results={allResults}
                      continued={previous?.role === 'assistant'}
                      calm={entry.safety}
                    />
                  );
                }
                return (
                  <li key={entry.id}>
                    <ChatResults results={entry.results} />
                  </li>
                );
              })}
            </ol>
          </div>

          {busy && (
            <p role="status" className="meta mt-6 flex items-center gap-2" data-testid="assistant-busy">
              <span className="inline-flex gap-1" aria-hidden="true">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="size-1.5 animate-pulse rounded-full bg-primary/60" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </span>
              {t('busy')}
            </p>
          )}

          {failed && !busy && (
            <ErrorState className="mt-6" title={t('errorTitle')} body={t('errorBody')} retryLabel={t('retry')} onRetry={retry} />
          )}

          {conversation.quickReplies && !busy && (
            <div className="mt-5">
              <SuggestedAnswerChips
                key={conversation.transcript.length}
                replies={conversation.quickReplies}
                onAnswer={answer}
                stacked={awaitingSafetyChoice}
              />
            </div>
          )}

          <div ref={endRef} className="scroll-mb-48" />

          <div className="sticky bottom-[calc(60px+env(safe-area-inset-bottom))] z-10 mt-8 border-t border-line bg-canvas pt-3 pb-3 lg:bottom-0 lg:pb-5">
            <ConversationComposer
              label={t('placeholder')}
              placeholder={t('placeholder')}
              disabled={busy}
              onSend={(text) => void send({ text })}
              footer={
                <div className="mt-2 space-y-1">
                  <AIProviderNotice mode={mode} />
                  <p className="text-[13px] leading-snug text-ink-3">{t('memoryNote')}</p>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRestart}
        onOpenChange={setConfirmRestart}
        title={t('restartTitle')}
        description={t('restartBody')}
        confirmLabel={t('restartConfirm')}
        onConfirm={() => reset(true)}
      />
      <ConfirmDialog
        open={confirmAi}
        onOpenChange={setConfirmAi}
        title={tModes('confirmAiTitle')}
        description={tModes('ai.description')}
        confirmLabel={tModes('confirmAi')}
        onConfirm={() => switchMode('ai')}
      />
    </div>
  );
}
