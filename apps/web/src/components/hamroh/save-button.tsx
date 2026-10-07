'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { useSaved, type SavedProgram } from '@/lib/use-saved';

export function SaveButton({ program, variant = 'text', className }: { program: SavedProgram; variant?: 'text' | 'secondary'; className?: string }) {
  const t = useTranslations('saved');
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(program.id);
  return (
    <button
      type="button"
      onClick={() => {
        toggle(program);
        toast(saved ? t('removedToast') : t('savedToast'));
      }}
      aria-pressed={saved}
      className={cn(variant === 'secondary' ? 'btn-secondary w-full' : 'action-quiet', className)}
    >
      <Heart className={cn('size-4 transition-colors', saved && 'fill-primary text-primary')} strokeWidth={1.9} aria-hidden="true" />
      {saved ? t('savedLabel') : t('save')}
    </button>
  );
}
