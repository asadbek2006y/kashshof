import type { OrganizationDetail } from '@/lib/api/client';
import { SUPPORT_TYPES } from '@/lib/vocab';

/** Where an organization's collected programs are available. */
export type Coverage = { kind: 'unknown' } | { kind: 'nationwide' } | { kind: 'regions'; regions: string[] };

export interface OrgFacts {
  /** Types of help, from the directory sections and the collected programs. */
  services: string[];
  coverage: Coverage;
  /** Groups the collected programs are designed for. */
  groups: string[];
  /** Documents any collected program asks for. */
  documents: string[];
}

const unique = <T,>(values: T[]) => [...new Set(values)];

/**
 * What can honestly be said about an organization from its collected programs — nothing more.
 * With no programs on record, coverage is "unknown", not "nationwide".
 */
export function orgFacts(org: Pick<OrganizationDetail, 'categories' | 'programs'>): OrgFacts {
  const programs = org.programs;
  const known = new Set<string>(SUPPORT_TYPES);
  const services = unique([...org.categories, ...programs.flatMap((p) => p.supportTypes)]).filter((s) => known.has(s));
  const coverage: Coverage =
    programs.length === 0
      ? { kind: 'unknown' }
      : programs.some((p) => p.regions.length === 0)
        ? { kind: 'nationwide' }
        : { kind: 'regions', regions: unique(programs.flatMap((p) => p.regions)) };
  return {
    services,
    coverage,
    groups: unique(programs.flatMap((p) => p.targetCircumstances)),
    documents: unique(programs.flatMap((p) => p.requiredDocuments)),
  };
}
