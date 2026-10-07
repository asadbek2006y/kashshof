'use client';

import { useLocale } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type QuickReplies } from '@/lib/api/client';
import { useConversation, type AssistantMode, type Entry } from './conversation-store';

export type TurnInput =
  | { text: string }
  | { choice: { slot: QuickReplies['slot']; values: string[] }; label: string };

// Control buttons that the server always answers deterministically (never with a model).
const DETERMINISTIC_SLOTS = new Set<QuickReplies['slot']>(['safety', 'next']);

/** Whether AI-assisted mode is configured on the server. undefined while loading. */
export function useAiAvailable(): boolean | undefined {
  const [available, setAvailable] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    void api
      .GET('/api/v1/assistant/info')
      .then(({ data }) => !cancelled && setAvailable(Boolean(data?.aiAvailable)))
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
}

/**
 * Sends one turn and folds the answer into the in-memory conversation. The browser holds the
 * whole state and sends it back each turn; the server keeps nothing.
 */
export function useAssistant() {
  const locale = useLocale();
  const store = useConversation();
  const { read, update, recordMatches } = store;
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<TurnInput | null | false>(false);
  const inFlight = useRef(false);

  const send = useCallback(
    async (input: TurnInput | null, modeOverride?: AssistantMode, isRetry = false) => {
      if (inFlight.current) return;
      inFlight.current = true;
      const current = read();
      const mode = modeOverride ?? current.mode ?? 'private';
      let nextId = (current.transcript.at(-1)?.id ?? 0) + 1;
      const transcript: Entry[] = [...current.transcript];
      // On a retry the person's message is already on screen.
      if (input && !isRetry) transcript.push({ id: nextId++, role: 'user', text: 'text' in input ? input.text : input.label });
      update({ ...current, mode, transcript, quickReplies: undefined });
      setBusy(true);
      setFailed(false);

      const { data, error } = await api
        .POST('/api/v1/assistant/turn', {
          body: {
            state: current.state,
            locale: locale as 'uz' | 'ru' | 'en',
            assistantMode: mode,
            ...(input && 'text' in input ? { text: input.text } : {}),
            ...(input && 'choice' in input ? { choice: input.choice } : {}),
          },
        })
        .catch(() => ({ data: undefined, error: true }));
      setBusy(false);
      inFlight.current = false;

      if (error || !data) {
        // What the person wrote stays on screen; offer to send the same turn again.
        update((c) => ({ ...c, quickReplies: current.quickReplies }));
        setFailed(input);
        return;
      }

      const safety = data.state.mode === 'safety';
      const deterministic = safety || (input !== null && 'choice' in input && DETERMINISTIC_SLOTS.has(input.choice.slot));
      const alreadyNoticed = transcript.some((e) => e.role === 'notice' && e.kind === 'aiFallback');
      if (mode === 'ai' && data.engine === 'scripted' && !deterministic && !alreadyNoticed) {
        transcript.push({ id: nextId++, role: 'notice', kind: 'aiFallback' });
      }
      for (const message of data.messages) transcript.push({ id: nextId++, role: 'assistant', message, safety });
      if (data.results && data.results.length > 0) {
        transcript.push({ id: nextId++, role: 'results', results: data.results });
      }
      update((c) => ({ ...c, state: data.state, engine: data.engine, transcript, quickReplies: data.quickReplies }));
      if (data.results) recordMatches(data.results);
    },
    [locale, read, update, recordMatches],
  );

  const retry = useCallback(() => {
    if (failed !== false) void send(failed, undefined, true);
  }, [failed, send]);

  /** Switch modes mid-conversation. Leaving AI mode drops the model's turn history. */
  const switchMode = useCallback(
    (mode: AssistantMode) =>
      update((c) => ({
        ...c,
        mode,
        state: c.state && mode === 'private' ? { ...c.state, history: undefined } : c.state,
      })),
    [update],
  );

  return { ...store, send, busy, failed: failed !== false, lastFailedInput: failed, retry, switchMode };
}
