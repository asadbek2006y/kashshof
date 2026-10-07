'use client';

import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import type { AssistantMessage, MatchResult } from '@/lib/api/client';
import { cn } from '@/lib/cn';
import { listFormat } from '@/lib/dates';
import { pick } from '@/lib/localized';
import { fadeUp } from '@/lib/motion';
import { useVocab } from '@/lib/use-vocab';

/** Renders an assistant message: an i18n key from the scripted engine, or finished text from Gemini. */
function MessageBody({ message, results }: { message: AssistantMessage; results: MatchResult[] }) {
  const t = useTranslations('ask');
  const locale = useLocale();
  const vocab = useVocab();
  if (message.text) return <p className="whitespace-pre-line">{message.text}</p>;

  const values: Record<string, string | number> = { ...(message.params ?? {}) };
  if (message.listKind === 'need' && message.list) values.needs = listFormat(locale, message.list.map(vocab.need));
  if (message.programId) {
    const match = results.find((r) => r.program.id === message.programId);
    values.program = match ? pick(match.program.title, locale) : '';
  }
  const text = vocab.t(`assistant.${message.key}`, values);
  if (message.listKind === 'document' && message.list) {
    return (
      <>
        <p>{text}</p>
        {message.list.length === 0 ? (
          <p className="meta mt-2">{t('noDocuments')}</p>
        ) : (
          <ol className="mt-2 list-decimal space-y-0.5 pl-5 marker:text-ink-3">
            {message.list.map((doc) => (
              <li key={doc}>{vocab.document(doc)}</li>
            ))}
          </ol>
        )}
      </>
    );
  }
  return <p>{text}</p>;
}

export function AssistantBubble({
  message,
  results,
  continued,
  calm,
}: {
  message: AssistantMessage;
  results: MatchResult[];
  continued: boolean;
  /** Safety turns render without entrance motion. */
  calm: boolean;
}) {
  const t = useTranslations('ask');
  return (
    <motion.li
      variants={calm ? undefined : fadeUp}
      initial={calm ? false : 'hidden'}
      animate="visible"
      className={cn('max-w-[42rem] text-[17px] leading-relaxed text-ink', continued && '-mt-3')}
      data-testid="assistant-message"
    >
      {!continued && <p className="label mb-1 text-primary">{t('assistantName')}</p>}
      <MessageBody message={message} results={results} />
    </motion.li>
  );
}

export function UserBubble({ text }: { text: string }) {
  const t = useTranslations('ask');
  return (
    <motion.li variants={fadeUp} initial="hidden" animate="visible" className="max-w-[85%] self-end text-right">
      <p className="label mb-1">{t('you')}</p>
      <p className="inline-block rounded-[var(--radius-md)] rounded-br-[4px] bg-primary px-4 py-2.5 text-left text-[16px] whitespace-pre-line text-white">
        {text}
      </p>
    </motion.li>
  );
}
