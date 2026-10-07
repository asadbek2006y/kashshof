'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AssistantMessage, AssistantState, MatchResult, QuickReplies } from '@/lib/api/client';

/**
 * The conversation lives in application memory only.
 *
 * Nothing the person types — and nothing derived from it, such as the structured profile — is
 * written to localStorage, sessionStorage, the URL or analytics. The provider sits above the
 * locale layout, so it survives navigation between pages; a reload, closing the tab or Quick exit
 * clears it. That is the privacy contract the UI describes.
 */

export type AssistantMode = 'ai' | 'private';

export type Entry =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; message: AssistantMessage; safety: boolean }
  | { id: number; role: 'results'; results: MatchResult[] }
  | { id: number; role: 'notice'; kind: 'aiFallback' };

export interface Conversation {
  /** Chosen before the first message. null = not chosen yet. */
  mode: AssistantMode | null;
  state?: AssistantState;
  engine?: 'gemini' | 'scripted';
  transcript: Entry[];
  quickReplies?: QuickReplies;
  /** Latest explained match per program — lets the program page say why it was shown. */
  matches: Record<string, MatchResult>;
}

/** Something handed to /ask by another page (a demo situation, a topic), held in memory only. */
export interface Handoff {
  text?: string;
  mode?: AssistantMode;
  /** True for the fictional demo situations on the home page. */
  demo?: boolean;
}

/**
 * True once the deterministic safety rules have fired in this conversation. It stays true for the
 * rest of the session (even after "Find safe services" moves the engine into results mode), so
 * urgent help keeps its place and nothing about the person is echoed on screen.
 */
export function hasSafetyConcern(conversation: Conversation): boolean {
  return (
    conversation.state?.mode === 'safety' ||
    Boolean(conversation.state?.profile.circumstances.includes('survivor')) ||
    conversation.transcript.some((entry) => entry.role === 'assistant' && entry.safety)
  );
}

const EMPTY: Conversation = { mode: null, transcript: [], matches: {} };

// Storage keys used by earlier versions, which kept the transcript in sessionStorage.
const LEGACY_KEYS = ['hamroh.chat', 'hamroh.pending'];

interface Store {
  conversation: Conversation;
  /** Synchronous read for async callbacks (always the latest value). */
  read: () => Conversation;
  update: (next: Conversation | ((current: Conversation) => Conversation)) => void;
  reset: (keepMode?: boolean) => void;
  recordMatches: (results: MatchResult[]) => void;
  setHandoff: (handoff: Handoff) => void;
  takeHandoff: () => Handoff | null;
}

const StoreContext = createContext<Store | null>(null);

/** Everything that must be forgotten on Quick exit registers here. */
const wipers = new Set<() => void>();

/** Forget the conversation everywhere in this tab. Called by Quick exit and "Start over". */
export function wipeSensitiveState(): void {
  wipers.forEach((wipe) => wipe());
  try {
    for (const key of LEGACY_KEYS) sessionStorage.removeItem(key);
    // Anything else Hamroh may have put in this tab's session storage.
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('hamroh.')) sessionStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable (private window) — nothing to clear.
  }
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<Conversation>(EMPTY);
  const ref = useRef<Conversation>(EMPTY);
  const handoff = useRef<Handoff | null>(null);

  const update = useCallback<Store['update']>((next) => {
    const value = typeof next === 'function' ? next(ref.current) : next;
    ref.current = value;
    setConversation(value);
  }, []);

  const reset = useCallback<Store['reset']>(
    (keepMode = false) => update((c) => ({ ...EMPTY, mode: keepMode ? c.mode : null })),
    [update],
  );

  useEffect(() => {
    const wipe = () => {
      handoff.current = null;
      update(EMPTY);
    };
    wipers.add(wipe);
    // Earlier versions persisted the transcript; make sure nothing of it lingers.
    try {
      for (const key of LEGACY_KEYS) sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    return () => {
      wipers.delete(wipe);
    };
  }, [update]);

  const read = useCallback(() => ref.current, []);
  const recordMatches = useCallback<Store['recordMatches']>(
    (results) =>
      update((c) => ({
        ...c,
        matches: { ...c.matches, ...Object.fromEntries(results.map((r) => [r.program.id, r])) },
      })),
    [update],
  );
  const setHandoff = useCallback<Store['setHandoff']>((value) => {
    handoff.current = value;
  }, []);
  const takeHandoff = useCallback<Store['takeHandoff']>(() => {
    const value = handoff.current;
    handoff.current = null;
    return value;
  }, []);

  // Every function is stable, so effects that depend on them don't re-run when the conversation changes.
  const store = useMemo<Store>(
    () => ({ conversation, read, update, reset, recordMatches, setHandoff, takeHandoff }),
    [conversation, read, update, reset, recordMatches, setHandoff, takeHandoff],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useConversation(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useConversation must be used inside <ConversationProvider>');
  return store;
}
