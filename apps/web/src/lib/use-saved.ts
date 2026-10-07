'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { SavedProgram } from './saved';
import { SAVED_KEY } from './storage';

export { toSaved, type SavedProgram } from './saved';

const listeners = new Set<() => void>();
const EMPTY: SavedProgram[] = [];
let cache: { raw: string | null; value: SavedProgram[] } = { raw: null, value: EMPTY };

function read(): SavedProgram[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVED_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cache.raw) {
    try {
      cache = { raw, value: raw ? (JSON.parse(raw) as SavedProgram[]) : EMPTY };
    } catch {
      cache = { raw, value: EMPTY };
    }
  }
  return cache.value;
}

function write(value: SavedProgram[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === SAVED_KEY && listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Saved programs live only in this browser (guest-first — no account needed). */
export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);
  const isSaved = useCallback((id: string) => saved.some((s) => s.id === id), [saved]);
  const toggle = useCallback(
    (program: SavedProgram) => {
      const current = read();
      write(current.some((s) => s.id === program.id) ? current.filter((s) => s.id !== program.id) : [program, ...current]);
    },
    [],
  );
  const clear = useCallback(() => write([]), []);
  return { saved, isSaved, toggle, clear };
}
