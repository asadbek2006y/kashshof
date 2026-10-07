import { ExternalLink, FileQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { sourceHost } from '@/lib/review-status';

/** The official page a program's information came from — or an honest "unavailable", never a guess. */
export function ProgramSource({
  url,
  variant = 'link',
  className,
}: {
  url: string | null;
  variant?: 'link' | 'button';
  className?: string;
}) {
  const t = useTranslations('source');
  const host = sourceHost(url);
  if (!url || !host) {
    return (
      <span className={cn('inline-flex min-h-11 items-center gap-1.5 text-[15px] text-ink-2', className)} data-testid="source-unavailable">
        <FileQuestion className="size-4 shrink-0" aria-hidden="true" />
        {t('unavailable')}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      referrerPolicy="no-referrer"
      className={cn(variant === 'button' ? 'btn-secondary' : 'action', 'max-w-full', className)}
      data-testid="source-link"
    >
      <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{t('official', { host })}</span>
      <span className="sr-only">{t('opensNewTab')}</span>
    </a>
  );
}
