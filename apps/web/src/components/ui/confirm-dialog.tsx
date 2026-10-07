'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from './button';
import { Dialog, DialogClose, DialogContent } from './dialog';

/** "Are you sure?" for actions that throw something away. Cancel is the default focus. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  tone = 'primary',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  tone?: 'primary' | 'danger';
}) {
  const t = useTranslations('common');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description}>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary" autoFocus>
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button
            variant={tone}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
