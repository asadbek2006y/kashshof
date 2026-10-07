/**
 * Date and list formatting that also works for Uzbek. Browsers ship little or no ICU data for
 * `uz` (dates render as "2026 M10 30", lists join with "and"), so Uzbek is formatted by hand.
 */
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const TIME_ZONE = 'Asia/Tashkent';

export function formatDay(locale: string, date: Date, withYear = false): string {
  if (locale === 'uz') {
    const parts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: TIME_ZONE })
      .formatToParts(date)
      .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
    const day = `${Number(parts.day)}-${UZ_MONTHS[Number(parts.month) - 1]}`;
    return withYear ? `${parts.year}-yil ${day}` : day;
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: TIME_ZONE,
  }).format(date);
}

export function listFormat(locale: string, items: string[]): string {
  if (locale === 'uz') {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} va ${items.at(-1)}`;
  }
  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
}

const DAY = 24 * 60 * 60 * 1000;

export function daysBetween(earlier: Date, later: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / DAY));
}
