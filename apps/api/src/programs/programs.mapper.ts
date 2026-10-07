import type { Organization, Program } from '../generated/prisma/client';
import type { LocalizedText } from '../domain/localized';
import type { MatchableProgram } from '../matching/matching';
import type { OrganizationDetailDto, ProgramDetailDto, ProgramSummaryDto } from './programs.dto';

export type ProgramWithOrg = Program & { org: Organization };

const iso = (date: Date | null) => (date ? date.toISOString() : null);

export function toProgramSummary(program: ProgramWithOrg): ProgramSummaryDto {
  return {
    id: program.id,
    title: program.title as LocalizedText,
    summary: program.summary as LocalizedText,
    supportTypes: program.supportTypes,
    genders: program.genders,
    requiredDocuments: program.requiredDocuments,
    applicationStatus: program.applicationStatus,
    deadline: iso(program.deadline),
    statusVerifiedAt: iso(program.statusVerifiedAt),
    isDraft: program.isDraft,
    origin: program.origin,
    sourceUrl: program.sourceUrl,
    regions: program.regions,
    targetCircumstances: program.targetCircumstances,
    organization: {
      slug: program.org.slug,
      name: program.org.name,
      verification: program.org.verification,
    },
  };
}

export function toProgramDetail(program: ProgramWithOrg): ProgramDetailDto {
  return {
    ...toProgramSummary(program),
    howToApply: (program.howToApply as LocalizedText | null) ?? null,
    ageMin: program.ageMin,
    ageMax: program.ageMax,
    requiredCircumstances: program.requiredCircumstances,
    incomeTested: program.incomeTested,
    source: program.org.source,
    researchedAt: iso(program.org.researchedAt),
  };
}

export function toOrganizationDetail(
  org: Organization,
  programs: ProgramWithOrg[],
): OrganizationDetailDto {
  return {
    slug: org.slug,
    name: org.name,
    verification: org.verification,
    description: org.description as LocalizedText,
    categories: org.categories,
    sections: org.sections,
    // Callers only map listed organizations (ProgramsService filters PARTNER/GROUPING out).
    kind: org.kind as OrganizationDetailDto['kind'],
    website: org.website,
    phone: org.phone,
    email: org.email,
    source: org.source,
    sourceUrl: org.sourceUrl,
    researchedAt: iso(org.researchedAt),
    lastVerifiedAt: iso(org.lastVerifiedAt),
    programs: programs.map(toProgramSummary),
  };
}

export function toMatchable(program: Program): MatchableProgram {
  return {
    id: program.id,
    supportTypes: program.supportTypes,
    genders: program.genders,
    ageMin: program.ageMin,
    ageMax: program.ageMax,
    regions: program.regions,
    targetCircumstances: program.targetCircumstances,
    requiredCircumstances: program.requiredCircumstances,
    incomeTested: program.incomeTested,
    applicationStatus: program.applicationStatus,
    deadline: program.deadline,
    statusVerifiedAt: program.statusVerifiedAt,
    isDraft: program.isDraft,
  };
}
