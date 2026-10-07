import type { Circumstance, Gender, Region, SupportType } from './vocabulary';

/**
 * Everything we know about the person's situation, built up progressively. Absence means
 * "unknown", never "no" — `circumstances` records confirmed situations and `notCircumstances`
 * records ones the person has told us don't apply, so the matcher can tell "we haven't asked"
 * apart from "doesn't qualify".
 */
export interface SupportProfile {
  needs: SupportType[];
  region?: Region;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  childrenCount?: number;
  circumstances: Circumstance[];
  notCircumstances: Circumstance[];
}

export function emptyProfile(): SupportProfile {
  return { needs: [], circumstances: [], notCircumstances: [] };
}

export interface MatchFilters {
  onlyOpen?: boolean;
  womenOnly?: boolean;
}
