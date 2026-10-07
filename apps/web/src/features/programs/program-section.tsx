import type { ReactNode } from 'react';

/** One titled section of a program page; the id doubles as the in-page anchor. */
export function ProgramSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-line pt-7 pb-2">
      <h2 id={`${id}-title`} className="mb-4 text-[21px] leading-snug font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <div className="text-[16px] leading-relaxed text-ink">{children}</div>
    </section>
  );
}
