'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { MatchReason } from './api/client';
import { makeVocab, reasonText, type LooseT } from './vocab';

export function useLooseT(): LooseT {
  const t = useTranslations();
  return t as unknown as LooseT;
}

export function useVocab() {
  const t = useLooseT();
  const locale = useLocale();
  return useMemo(() => {
    const vocab = makeVocab(t);
    return {
      ...vocab,
      t,
      locale,
      reason: (r: MatchReason) =>
        reasonText(r, t, vocab, locale),
    };
  }, [t, locale]);
}
