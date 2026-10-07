import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  // Plain Uzbek first; the switcher is always one tap away.
  defaultLocale: 'uz',
});

export type AppLocale = (typeof routing.locales)[number];
