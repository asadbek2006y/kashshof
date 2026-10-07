'use client';

import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { useVocab } from '@/lib/use-vocab';

/**
 * Documents to gather, as a checklist the person can tick off. Ticks live only in this page's
 * memory — nothing about which documents someone has is stored.
 */
export function DocumentChecklist({
  documents,
  checked: controlled,
  onChange,
  testId = 'document-checklist',
}: {
  documents: string[];
  checked?: string[];
  onChange?: (checked: string[]) => void;
  testId?: string;
}) {
  const t = useTranslations('documents');
  const vocab = useVocab();
  const id = useId();
  const [local, setLocal] = useState<string[]>([]);
  const checked = controlled ?? local;
  const set = (next: string[]) => (onChange ? onChange(next) : setLocal(next));

  return (
    <div data-testid={testId}>
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
        {documents.map((doc) => {
          const on = checked.includes(doc);
          const inputId = `${id}-${doc}`;
          return (
            <li key={doc}>
              <label htmlFor={inputId} className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-canvas">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={on}
                  onChange={() => set(on ? checked.filter((d) => d !== doc) : [...checked, doc])}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
                    on ? 'border-success bg-success text-white' : 'border-control bg-surface',
                  )}
                  aria-hidden="true"
                >
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Check className="size-4" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className={cn('text-[16px] text-ink', on && 'text-ink-2 line-through decoration-ink-3')}>{vocab.document(doc)}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="meta mt-2" role="status">
        {t('progress', { done: checked.length, total: documents.length })}
      </p>
    </div>
  );
}
