import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isAcceptingApplications } from '../matching/matching';
import {
  toMatchable,
  toOrganizationDetail,
  toProgramDetail,
  toProgramSummary,
  type ProgramWithOrg,
} from './programs.mapper';
import {
  LISTED_KINDS,
  type OrganizationDetailDto,
  type OrganizationListQueryDto,
  type ProgramDetailDto,
  type ProgramListQueryDto,
  type ProgramSummaryDto,
} from './programs.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every published program — the catalogue is small enough to match in memory. */
  async published(): Promise<ProgramWithOrg[]> {
    return this.prisma.program.findMany({
      where: { isDraft: false, org: { hidden: false } },
      include: { org: true },
      orderBy: { id: 'asc' },
    });
  }

  async list(query: ProgramListQueryDto): Promise<ProgramSummaryDto[]> {
    const now = new Date();
    const programs = await this.prisma.program.findMany({
      where: {
        isDraft: false,
        org: { hidden: false },
        ...(query.supportType ? { supportTypes: { has: query.supportType } } : {}),
        ...(query.org ? { orgSlug: query.org } : {}),
        ...(query.region
          ? { OR: [{ regions: { isEmpty: true } }, { regions: { has: query.region } }] }
          : {}),
      },
      include: { org: true },
      orderBy: { id: 'asc' },
    });
    return programs
      .filter((program) => !query.open || isAcceptingApplications(toMatchable(program), now))
      .map(toProgramSummary);
  }

  async get(id: string): Promise<ProgramDetailDto> {
    const program = await this.prisma.program.findFirst({
      where: { id, isDraft: false, org: { hidden: false } },
      include: { org: true },
    });
    if (!program) throw new NotFoundException('Program not found');
    return toProgramDetail(program);
  }

  async listOrganizations(query: OrganizationListQueryDto = {}): Promise<OrganizationDetailDto[]> {
    const q = query.q?.trim();
    const orgs = await this.prisma.organization.findMany({
      where: {
        kind: { in: [...LISTED_KINDS] },
        hidden: false,
        ...(query.section ? { sections: { has: query.section } } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
      },
      orderBy: { name: 'asc' },
      include: { programs: { where: { isDraft: false }, include: { org: true }, orderBy: { id: 'asc' } } },
    });
    return orgs.map((org) => toOrganizationDetail(org, org.programs));
  }

  async getOrganization(slug: string): Promise<OrganizationDetailDto> {
    const org = await this.prisma.organization.findFirst({
      where: { slug, kind: { in: [...LISTED_KINDS] }, hidden: false },
      include: { programs: { where: { isDraft: false }, include: { org: true }, orderBy: { id: 'asc' } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return toOrganizationDetail(org, org.programs);
  }
}
