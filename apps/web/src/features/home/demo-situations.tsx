'use client';

import { ArrowRight, Baby, Scale, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useConversation } from '@/features/chat/conversation-store';
import { useRouter } from '@/i18n/navigation';

const SCENARIOS = [
  { key: 'singleParent', icon: Wallet },
  { key: 'childDisability', icon: Baby },
  { key: 'legal', icon: Scale },
] as const;

/**
 * Fictional situations for demonstrations: one tap starts a private guided conversation with the
 * story already told. Handed over in memory, never in the URL. No safety or abuse scenario is
 * offered as a demo.
 */
export function DemoSituations({ stacked = false }: { stacked?: boolean }) {
  const t = useTranslations('demo');
  const router = useRouter();
  const { reset, setHandoff } = useConversation();
  return (
    <ul className={stacked ? 'grid gap-3 md:grid-cols-3 lg:grid-cols-1' : 'grid gap-3 md:grid-cols-3'} data-testid="demo-situations">
      {SCENARIOS.map(({ key, icon: Icon }) => (
        <li key={key}>
          <button
            type="button"
            className="card flex h-full w-full flex-col items-start gap-2 p-5 text-left transition-colors hover:border-primary"
            onClick={() => {
              reset();
              setHandoff({ text: t(`${key}.story`), mode: 'private', demo: true });
              router.push('/ask');
            }}
            data-testid={`demo-${key}`}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="rounded-[6px] bg-sunken px-2 py-0.5 text-[12px] font-semibold tracking-[0.03em] text-ink-2 uppercase">
                {t('fictional')}
              </span>
            </span>
            <span className="text-[17px] font-semibold text-ink">{t(`${key}.title`)}</span>
            <span className="text-[15px] leading-snug text-ink-2">“{t(`${key}.story`)}”</span>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[15px] font-semibold text-primary">
              {t('try')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
