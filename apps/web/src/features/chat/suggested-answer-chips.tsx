'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { QuickReplies } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { listFormat } from '@/lib/dates';
import { fadeIn } from '@/lib/motion';
import { useVocab } from '@/lib/use-vocab';
import type { TurnInput } from './use-assistant';

const ROOT_LABEL_PREFIXES = ['need.', 'region.', 'ageBand.', 'situation.'];

/** Tappable answers, so nobody has to type what they could pick. */
export function SuggestedAnswerChips({
  replies,
  onAnswer,
  stacked = false,
}: {
  replies: QuickReplies;
  onAnswer: (input: TurnInput) => void;
  stacked?: boolean;
}) {
  const t = useTranslations('ask');
  const locale = useLocale();
  const vocab = useVocab();
  const [selected, setSelected] = useState<string[]>([]);
  const labelFor = (labelKey: string) =>
    ROOT_LABEL_PREFIXES.some((p) => labelKey.startsWith(p)) ? vocab.t(labelKey) : vocab.t(`assistant.${labelKey}`);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={replies.multi ? t('chooseMany') : t('chooseOne')}
      className={cn(stacked ? 'grid max-w-[28rem] gap-2' : 'flex flex-wrap gap-2')}
      data-testid="quick-replies"
    >
      {replies.options.map((option) => {
        const label = labelFor(option.labelKey);
        if (option.href) {
          return (
            <Link key={option.value} href={option.href} className="choice">
              {label}
            </Link>
          );
        }
        if (replies.multi) {
          const on = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              className="choice"
              onClick={() => setSelected((s) => (on ? s.filter((v) => v !== option.value) : [...s, option.value]))}
            >
              {label}
            </button>
          );
        }
        return (
          <button
            key={option.value}
            type="button"
            className="choice"
            onClick={() => onAnswer({ choice: { slot: replies.slot, values: [option.value] }, label })}
          >
            {label}
          </button>
        );
      })}
      {replies.multi && (
        <button
          type="button"
          className="btn-primary"
          disabled={selected.length === 0}
          onClick={() =>
            onAnswer({
              choice: { slot: replies.slot, values: selected },
              label: listFormat(
                locale,
                selected.map((v) => labelFor(replies.options.find((o) => o.value === v)!.labelKey)),
              ),
            })
          }
        >
          {t('continue')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
