'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

/** Client-only app context: reduced-motion handling and non-critical toasts. */
export function ShellProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="bottom-center"
        offset={{ bottom: 88 }}
        mobileOffset={{ bottom: 88 }}
        toastOptions={{ className: '!rounded-[var(--radius-md)] !border-line !text-[15px] !font-sans' }}
      />
    </MotionConfig>
  );
}
