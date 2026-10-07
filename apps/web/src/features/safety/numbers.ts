/**
 * Urgent numbers. 112 and 101–103: Gazeta.uz, 26 March 2025 (112 works in every region).
 * 1146: gov.uz — trust line where specialists advise women facing pressure or violence.
 */
export const URGENT_NUMBERS = [
  { number: '112', key: 'n112' },
  { number: '1146', key: 'n1146' },
  { number: '102', key: 'n102' },
  { number: '103', key: 'n103' },
  { number: '101', key: 'n101' },
] as const;

export const NUMBER_SOURCES = [
  { label: 'Gazeta.uz', href: 'https://www.gazeta.uz/en/2025/03/26/112/' },
  { label: 'gov.uz', href: 'https://gov.uz/oz/advice/733/document/3440' },
] as const;
