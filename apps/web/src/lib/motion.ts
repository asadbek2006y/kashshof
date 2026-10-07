import type { Transition, Variants } from 'motion/react';

/**
 * Shared motion vocabulary. Motion communicates state (something arrived, something opened) and
 * stays between 150 and 300ms. `MotionConfig reducedMotion="user"` in the shell turns transforms
 * off for people who ask their system for less motion. Safety screens don't animate at all.
 */
export const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
};

/** Parent for lists whose children use `fadeUp`: a very slight stagger. */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

/** Height + opacity for disclosure panels (match explanations). */
export const collapse: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.18, ease: EASE_OUT } },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.24, ease: EASE_OUT } },
};

export const tap = { scale: 0.98 } as const;
