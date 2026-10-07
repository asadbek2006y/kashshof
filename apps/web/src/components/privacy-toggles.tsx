'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

const SETTINGS = ['shareOnlyWhenApplying', 'rememberConversations', 'deadlineReminders'] as const;

export function PrivacyToggles() {
  const t = useTranslations('profile.privacy');
  const [on, setOn] = useState<Record<string, boolean>>({ shareOnlyWhenApplying: true, rememberConversations: false, deadlineReminders: true });
  return (
    <ul>
      {SETTINGS.map((key) => (
        <li key={key} className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-0">
          <span>
            <span className="block text-[16px] text-ink">{t(`${key}.label`)}</span>
            <span className="meta block">{t(`${key}.hint`)}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on[key]}
            aria-label={t(`${key}.label`)}
            onClick={() => setOn((s) => ({ ...s, [key]: !s[key] }))}
            className={`relative mt-1 h-6 w-10 shrink-0 rounded-full transition-colors ${on[key] ? 'bg-primary' : 'bg-line-strong'}`}
          >
            <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on[key] ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </li>
      ))}
    </ul>
  );
}
