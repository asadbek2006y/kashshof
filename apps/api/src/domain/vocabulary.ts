/**
 * Closed vocabularies shared by the database, matching engine and assistant. The web app owns
 * every human-readable label for these values (messages/{uz,ru,en}.json), so adding a value
 * here means adding its label there too.
 */

export const SUPPORT_TYPES = [
  'financial',
  'education',
  'food',
  'health',
  'maternity',
  'children_family',
  'employment',
  'business',
  'housing',
  'legal',
  'safety',
  'disability',
  'mental_wellbeing',
  'emergency',
] as const;
export type SupportType = (typeof SUPPORT_TYPES)[number];

export const REGIONS = [
  'tashkent_city',
  'tashkent_region',
  'andijan',
  'bukhara',
  'fergana',
  'jizzakh',
  'kashkadarya',
  'khorezm',
  'namangan',
  'navoi',
  'samarkand',
  'surkhandarya',
  'syrdarya',
  'karakalpakstan',
] as const;
export type Region = (typeof REGIONS)[number];

/** Situations a person may be in. Asked about with dignity, never as a label. */
export const CIRCUMSTANCES = [
  'student',
  'employed',
  'unemployed',
  'single_parent',
  'has_children',
  'pregnant',
  'disability',
  'low_income',
  'entrepreneur',
  'survivor',
  // Young people who grew up in, or are leaving, alternative (state or foster) care.
  'care_leaver',
] as const;
export type Circumstance = (typeof CIRCUMSTANCES)[number];

export const DOCUMENTS = [
  'id_document',
  'income_certificate',
  'enrollment_certificate',
  'birth_certificate',
  'medical_report',
  'disability_certificate',
  'residence_certificate',
  'business_plan',
  'family_composition',
] as const;
export type DocumentType = (typeof DOCUMENTS)[number];

export const GENDERS = ['female', 'male'] as const;
export type Gender = (typeof GENDERS)[number];

/** Age bands offered as tappable answers; typed ages are stored exactly (min === max). */
export const AGE_BANDS = {
  under_18: { min: 14, max: 17 },
  '18_24': { min: 18, max: 24 },
  '25_34': { min: 25, max: 34 },
  '35_44': { min: 35, max: 44 },
  '45_59': { min: 45, max: 59 },
  '60_plus': { min: 60, max: 99 },
} as const;
export type AgeBand = keyof typeof AGE_BANDS;

export const LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Kinds shown to people; PARTNER and GROUPING never are (see prisma/schema.prisma). */
export const LISTED_KINDS = ['NGO', 'INTERNATIONAL', 'GOVERNMENT'] as const;
/** Sections of the source organization list (prisma/directory-data.ts). */
export const DIRECTORY_SECTIONS = [
  'children_family',
  'health',
  'social_support',
  'disability',
  'education_youth',
  'women_girls',
  'food_humanitarian',
  'emergency',
  'faith_zakat',
  'development',
] as const;
