import { RotateCw, SearchX, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Nothing to show — always paired with a way forward, never "no help is available". */
export function EmptyState({
  title,
  body,
  actions,
  icon: Icon = SearchX,
  className,
}: {
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  icon?: typeof SearchX;
  className?: string;
}) {
  return (
    <section className={cn('card px-5 py-8 text-center sm:px-10', className)} data-testid="empty-state">
      <Icon className="mx-auto size-8 text-ink-3" aria-hidden="true" />
      <h2 className="mt-3 text-[19px] font-semibold text-ink">{title}</h2>
      {body && <div className="meta mx-auto mt-2 max-w-[34rem]">{body}</div>}
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div>}
    </section>
  );
}

/** Something failed to load. Says what did *not* change, and offers a retry. */
export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
  className,
}: {
  title: ReactNode;
  body?: ReactNode;
  retryLabel?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section role="alert" className={cn('card border-warning/40 px-5 py-6 sm:px-6', className)} data-testid="error-state">
      <div className="flex gap-3">
        <WifiOff className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          {body && <p className="meta mt-1">{body}</p>}
          {onRetry && retryLabel && (
            <button type="button" onClick={onRetry} className="btn-secondary mt-4">
              <RotateCw className="size-4" aria-hidden="true" />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
