import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-8 pb-8 sm:pt-12">
      <div className="max-w-[42rem]">
        {eyebrow && <p className="kicker mb-3">{eyebrow}</p>}
        <h1 className="title-page">{title}</h1>
        {lead && <p className="lead mt-3">{lead}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Heading for a section inside a page, with an optional short lead. */
export function SectionHeading({ id, title, lead, level = 2 }: { id?: string; title: ReactNode; lead?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="mb-5">
      <H id={id} className={level === 2 ? 'title-section' : 'title-item'}>
        {title}
      </H>
      {lead && <p className="meta mt-1.5 max-w-[40rem]">{lead}</p>}
    </div>
  );
}
