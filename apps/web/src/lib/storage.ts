'use client';

/**
 * Browser storage helpers. Everything the person tells the assistant stays in sessionStorage
 * (gone when the tab closes, wiped by Quick Exit); only explicitly saved programs use
 * localStorage. Every access is guarded — private windows can throw.
 */
export function readJson<T>(storage: 'session' | 'local', key: string): T | null {
  try {
    const raw = (storage === 'session' ? sessionStorage : localStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(storage: 'session' | 'local', key: string, value: unknown): void {
  try {
    (storage === 'session' ? sessionStorage : localStorage).setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the app still works, it just won't remember.
  }
}

export function removeKey(storage: 'session' | 'local', key: string): void {
  try {
    (storage === 'session' ? sessionStorage : localStorage).removeItem(key);
  } catch {
    // ignore
  }
}

export const CHAT_KEY = 'hamroh.chat';
export const SAVED_KEY = 'hamroh.saved';
