import { SUPPORT_TYPES } from '@/lib/vocab';

/** Order support categories are offered in. Only categories that have programs are shown. */
export const CATEGORY_ORDER: readonly (typeof SUPPORT_TYPES)[number][] = [
  'financial', 'children_family', 'disability', 'legal', 'employment', 'housing', 'safety', 'health',
  'education', 'maternity', 'food', 'business', 'mental_wellbeing', 'emergency',
];
