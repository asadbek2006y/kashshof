/**
 * Every photo and video on the site, with its licence. Both CC BY-SA works require attribution;
 * shown next to each photo and on /credits. Source files: Wikimedia Commons.
 */
export const MEDIA_CREDITS = [
  {
    key: 'navruz',
    author: 'Lokk1y',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Navruz.webm',
  },
  {
    key: 'dasturkhan',
    author: 'Sinchalak Musulmon',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:An_Uzbek_woman_with_dasturkhan.jpg',
  },
  {
    key: 'motherChild',
    author: 'Adam Jones',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mother_and_Child_at_Bibi-Khanym_Mosque_-_Samarkand_-_Uzbekistan_(7488576564).jpg',
  },
] as const;

export type MediaKey = (typeof MEDIA_CREDITS)[number]['key'];
export const creditFor = (key: MediaKey) => MEDIA_CREDITS.find((c) => c.key === key)!;
