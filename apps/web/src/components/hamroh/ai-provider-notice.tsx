import { Bot, ListChecks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

/** Which assistant is answering, and what that means for the person's words. */
export function AIProviderNotice({ mode, className }: { mode: 'ai' | 'private'; className?: string }) {
  const t = useTranslations('modes');
  const Icon = mode === 'ai' ? Bot : ListChecks;
  return (
    <p className={cn('flex gap-2 text-[13.5px] leading-snug text-ink-2', className)} data-testid="ai-provider-notice" data-mode={mode}>
      <Icon className="mt-[1px] size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold text-ink">{t(`${mode}.name`)}.</span> {t(`${mode}.short`)}
      </span>
    </p>
  );
}
