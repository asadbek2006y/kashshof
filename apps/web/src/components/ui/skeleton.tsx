import { cn } from '@/lib/cn';

/** A calm placeholder block. Reserves the space content will take, so nothing jumps. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-[var(--radius-sm)] bg-sunken', className)} />;
}

/** Placeholder with the shape of a match or program card. */
export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="card space-y-3 p-5 sm:p-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  );
}
