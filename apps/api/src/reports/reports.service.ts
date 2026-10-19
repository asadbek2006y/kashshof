import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { LISTED_KINDS } from '../domain/vocabulary';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReportDto, ReportDto, ReportListQueryDto, ReportReceiptDto, UpdateReportDto } from './reports.dto';

const HOUR_MS = 60 * 60 * 1000;
/** Spam limits, counted from stored reports so nothing about the sender (such as an IP) is kept. */
export const MAX_NEW_REPORTS_PER_ORG_PER_HOUR = 20;
export const MAX_NEW_REPORTS_PER_HOUR = 200;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stores a report for a person to review. It never changes the organization's data by itself. */
  async create(dto: CreateReportDto, now = new Date()): Promise<ReportReceiptDto> {
    const org = await this.prisma.organization.findFirst({
      where: { slug: dto.orgSlug, hidden: false, kind: { in: [...LISTED_KINDS] } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    if (dto.programId) {
      const program = await this.prisma.program.findFirst({ where: { id: dto.programId, orgSlug: org.slug, isDraft: false } });
      if (!program) throw new NotFoundException('Program not found');
    }

    const since = new Date(now.getTime() - HOUR_MS);
    const [forOrg, total] = await Promise.all([
      this.prisma.infoReport.count({ where: { orgSlug: org.slug, createdAt: { gte: since } } }),
      this.prisma.infoReport.count({ where: { createdAt: { gte: since } } }),
    ]);
    if (forOrg >= MAX_NEW_REPORTS_PER_ORG_PER_HOUR || total >= MAX_NEW_REPORTS_PER_HOUR) {
      throw new HttpException('Too many reports right now. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const report = await this.prisma.infoReport.create({
      data: { orgSlug: org.slug, programId: dto.programId ?? null, reason: dto.reason, details: dto.details ?? null },
    });
    return { id: report.id, status: report.status };
  }

  async list(query: ReportListQueryDto): Promise<ReportDto[]> {
    const reports = await this.prisma.infoReport.findMany({
      where: { status: query.status ?? 'NEW' },
      include: { org: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return reports.map((r) => ({
      id: r.id,
      status: r.status,
      orgSlug: r.orgSlug,
      orgName: r.org.name,
      programId: r.programId,
      reason: r.reason,
      details: r.details,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async review(id: string, dto: UpdateReportDto): Promise<ReportReceiptDto> {
    const existing = await this.prisma.infoReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Report not found');
    const report = await this.prisma.infoReport.update({ where: { id }, data: { status: dto.status } });
    return { id: report.id, status: report.status };
  }
}
