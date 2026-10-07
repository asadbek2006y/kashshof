'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const STEPS = ['requirements', 'answers', 'explanations'] as const;

/**
 * What the deterministic matcher is doing while results load. These are the real steps of
 * matching.ts (filter by requirements, compare answers, attach reasons) — not an AI "thinking".
 * Steps advance on a short timer only for readability; the list disappears as soon as data arrives.
 */
export function MatchingProgress() {
  const t = useTranslations('matchingProgress');
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 350);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div role="status" className="card px-5 py-4" data-testid="matching-progress">
      <ul className="space-y-1.5 text-[15px]">
        {STEPS.map((key, i) => (
          <li key={key} className={i <= step ? 'flex items-center gap-2 text-ink' : 'flex items-center gap-2 text-ink-3'}>
            {i < step ? (
              <Check className="size-4 text-success" aria-hidden="true" />
            ) : i === step ? (
              <Loader2 className="size-4 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <span className="size-4" aria-hidden="true" />
            )}
            {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
