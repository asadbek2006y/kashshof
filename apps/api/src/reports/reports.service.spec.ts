import { HttpException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { PrismaService } from '../prisma/prisma.service';
import { assertReviewer } from './reports.controller';
import { CreateReportDto, REPORT_DETAILS_MAX } from './reports.dto';
import { MAX_NEW_REPORTS_PER_ORG_PER_HOUR, ReportsService } from './reports.service';

// @nestjs/* v12 ships ESM only, which Jest's CommonJS runtime can't load (see
// assistant.service.spec.ts): decorators become no-ops, exceptions stay real classes.
jest.mock('@nestjs/common', () => {
  class HttpException extends Error {
    constructor(message: string, readonly status: number) {
      super(message);
    }
  }
  class NotFoundException extends HttpException {
    constructor(message = 'Not Found') {
      super(message, 404);
    }
  }
  const exports: Record<string, unknown> = { HttpException, NotFoundException, HttpStatus: { TOO_MANY_REQUESTS: 429 } };
  return new Proxy(exports, { get: (target, key: string) => (key in target ? target[key] : () => () => undefined) });
});
jest.mock('@nestjs/swagger', () => new Proxy({}, { get: () => () => () => undefined }));
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));

function setup({ org = { slug: 'zamin', name: 'Zamin' } as object | null, program = null as object | null, recent = 0 } = {}) {
  const prisma = {
    organization: { findFirst: jest.fn().mockResolvedValue(org) },
    program: { findFirst: jest.fn().mockResolvedValue(program) },
    infoReport: {
      count: jest.fn().mockResolvedValue(recent),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'r1', status: 'NEW', ...data })),
    },
  };
  return { prisma, service: new ReportsService(prisma as unknown as PrismaService) };
}

describe('ReportsService.create', () => {
  it('stores a NEW report with only the fields the form asks for', async () => {
    const { prisma, service } = setup();
    await expect(service.create({ orgSlug: 'zamin', reason: 'BROKEN_CONTACT', details: 'Phone does not answer' })).resolves.toEqual({
      id: 'r1',
      status: 'NEW',
    });
    expect(prisma.infoReport.create).toHaveBeenCalledWith({
      data: { orgSlug: 'zamin', programId: null, reason: 'BROKEN_CONTACT', details: 'Phone does not answer' },
    });
  });

  it('only accepts reports about organizations people can see', async () => {
    const { prisma, service } = setup({ org: null });
    await expect(service.create({ orgSlug: 'mehr-nuri', reason: 'OTHER' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: { slug: 'mehr-nuri', hidden: false, kind: { in: ['NGO', 'INTERNATIONAL', 'GOVERNMENT'] } },
    });
    expect(prisma.infoReport.create).not.toHaveBeenCalled();
  });

  it('rejects a program that is not one of the organization’s published programs', async () => {
    const { prisma, service } = setup({ program: null });
    await expect(service.create({ orgSlug: 'zamin', programId: 'other', reason: 'OUTDATED' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.infoReport.create).not.toHaveBeenCalled();
  });

  it('limits floods of reports without storing anything about the sender', async () => {
    const { prisma, service } = setup({ recent: MAX_NEW_REPORTS_PER_ORG_PER_HOUR });
    await expect(service.create({ orgSlug: 'zamin', reason: 'OTHER' })).rejects.toBeInstanceOf(HttpException);
    expect(prisma.infoReport.create).not.toHaveBeenCalled();
  });
});

describe('CreateReportDto', () => {
  const errors = async (body: object) => (await validate(plainToInstance(CreateReportDto, body))).map((e) => e.property);

  it('accepts a reason with optional details, trimming blank details away', async () => {
    expect(await errors({ orgSlug: 'zamin', reason: 'NOT_OPERATING' })).toEqual([]);
    expect(plainToInstance(CreateReportDto, { orgSlug: 'zamin', reason: 'OTHER', details: '   ' }).details).toBeUndefined();
  });

  it('rejects unknown reasons and over-long details', async () => {
    expect(await errors({ orgSlug: 'zamin', reason: 'SPAM' })).toEqual(['reason']);
    expect(await errors({ orgSlug: 'zamin', reason: 'OTHER', details: 'x'.repeat(REPORT_DETAILS_MAX + 1) })).toEqual(['details']);
  });
});

describe('assertReviewer', () => {
  it('hides the review endpoints unless the configured token matches', () => {
    expect(() => assertReviewer('secret', undefined)).toThrow(NotFoundException);
    expect(() => assertReviewer(undefined, 'secret')).toThrow(NotFoundException);
    expect(() => assertReviewer('wrong!', 'secret')).toThrow(NotFoundException);
    expect(() => assertReviewer('secret', 'secret')).not.toThrow();
  });
});
