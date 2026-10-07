/** Wordmark with a small mark: two overlapping shapes — someone beside you. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
        <rect width="24" height="24" rx="7" fill="var(--color-primary)" />
        <circle cx="9.5" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="14.5" cy="12" r="4.5" fill="none" stroke="#b9dcd5" strokeWidth="2" />
      </svg>
      <span className="hidden text-[20px] leading-none font-bold tracking-[-0.02em] text-ink min-[480px]:inline">Kashshof</span>
    </span>
  );
}
