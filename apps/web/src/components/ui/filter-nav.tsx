import type { ReactNode } from 'react';

/**
 * Category filters: a vertical text list beside the results on desktop, a scrollable row of
 * underlined tabs on phones. Items are links, so filtering works without JavaScript.
 */
export function FilterNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-0">
      <p className="kicker mb-2 hidden lg:block">{label}</p>
      <ul className="flex gap-5 border-b border-line lg:flex-col lg:gap-0 lg:border-0">{children}</ul>
    </nav>
  );
}

export function filterItemClass(active: boolean) {
  return `tab lg:min-h-10 lg:w-full lg:border-b-0 lg:border-l-2 lg:pl-3 ${active ? '' : 'lg:border-transparent'}`;
}
