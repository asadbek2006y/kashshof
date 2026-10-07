import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { toProgramDetail } from '../programs/programs.mapper';
import type { ProgramDetailDto } from '../programs/programs.dto';
import type { CreateProgramDto } from './org.dto';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  /** Saves a submitted program as a draft; drafts never reach public listings or matching. */
  async createDraft(dto: CreateProgramDto): Promise<ProgramDetailDto> {
    const org = await this.prisma.organization.findUnique({ where: { slug: dto.orgSlug } });
    if (!org) throw new NotFoundException('Organization not found');
    if (dto.ageMin !== undefined && dto.ageMax !== undefined && dto.ageMin > dto.ageMax) {
      throw new BadRequestException('ageMin must not be greater than ageMax');
    }
    if (dto.supportTypes.length === 0) throw new BadRequestException('Choose at least one support type');

    const program = await this.prisma.program.create({
      data: {
        id: `${dto.orgSlug}-draft-${randomUUID().slice(0, 8)}`,
        orgSlug: dto.orgSlug,
        title: { [dto.locale]: dto.title },
        summary: { [dto.locale]: dto.summary },
        supportTypes: dto.supportTypes,
        genders: dto.genders,
        ageMin: dto.ageMin ?? null,
        ageMax: dto.ageMax ?? null,
        regions: dto.regions,
        requiredDocuments: dto.requiredDocuments,
        applicationStatus: dto.applicationStatus,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        statusVerifiedAt: new Date(),
        isDraft: true,
      },
      include: { org: true },
    });
    return toProgramDetail(program);
  }

  async drafts(): Promise<ProgramDetailDto[]> {
    const programs = await this.prisma.program.findMany({
      where: { isDraft: true },
      include: { org: true },
      orderBy: { createdAt: 'desc' },
    });
    return programs.map(toProgramDetail);
  }
}
