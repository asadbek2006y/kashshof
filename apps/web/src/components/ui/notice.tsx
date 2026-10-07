import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'info' | 'warn' | 'danger';

const TONE: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: 'border-line bg-surface', icon: Info },
  warn: { box: 'border-warning/30 bg-warning-soft', icon: AlertTriangle },
  danger: { box: 'border-danger/30 bg-danger-soft', icon: ShieldAlert },
};

/** A short aside with an icon. Important information never lives only in a toast — it lives here. */
export function Notice({
  tone = 'info',
  title,
  children,
  className,
  role = 'note',
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: 'note' | 'status' | 'alert';
}) {
  const { box, icon: Icon } = TONE[tone];
  return (
    <div role={role} className={cn('flex gap-3 rounded-[var(--radius-md)] border px-4 py-3.5', box, className)}>
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', tone === 'warn' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-primary')}
        aria-hidden="true"
      />
      <div className="min-w-0">
        {title && <p className="text-[16px] leading-snug font-semibold text-ink">{title}</p>}
        {children && <div className={cn('text-[15px] leading-relaxed text-ink-2', title && 'mt-1')}>{children}</div>}
      </div>
    </div>
  );
}

/** Shown wherever invented sample program data appears in detail. */
export function PrototypeDataNotice() {
  const t = useTranslations('notices');
  return (
    <Notice tone="warn" title={t('prototypeTitle')}>
      {t('prototypeBody')}
    </Notice>
  );
}

/** Shown on the signed-in screens, which use a fixed demo persona instead of an account. */
export function DemoPersonaNotice() {
  const t = useTranslations('notices');
  return <Notice title={t('demoTitle')}>{t('demoBody')}</Notice>;
}

/** Shown on programs collected from public sources: real, sourced, but not reviewed by a person yet. */
export function ResearchedDataNotice() {
  const t = useTranslations('notices');
  return <Notice title={t('researchedTitle')}>{t('researchedBody')}</Notice>;
}
