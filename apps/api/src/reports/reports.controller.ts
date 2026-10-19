import { Body, Controller, Get, Headers, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { timingSafeEqual } from 'node:crypto';
import { CreateReportDto, ReportDto, ReportListQueryDto, ReportReceiptDto, UpdateReportDto } from './reports.dto';
import { ReportsService } from './reports.service';

/**
 * Reports of inaccurate organization information. Anyone can file one; reviewing them needs the
 * REPORTS_REVIEW_TOKEN (sent as x-review-token). Without that variable the review endpoints
 * don't exist — the prototype has no staff accounts.
 */
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @ApiCreatedResponse({ type: ReportReceiptDto })
  @ApiNotFoundResponse()
  @ApiTooManyRequestsResponse()
  create(@Body() body: CreateReportDto): Promise<ReportReceiptDto> {
    return this.reports.create(body);
  }

  @Get()
  @ApiHeader({ name: 'x-review-token', required: true })
  @ApiOkResponse({ type: [ReportDto] })
  list(@Headers('x-review-token') token: string | undefined, @Query() query: ReportListQueryDto): Promise<ReportDto[]> {
    assertReviewer(token);
    return this.reports.list(query);
  }

  @Patch(':id')
  @ApiHeader({ name: 'x-review-token', required: true })
  @ApiOkResponse({ type: ReportReceiptDto })
  review(
    @Headers('x-review-token') token: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateReportDto,
  ): Promise<ReportReceiptDto> {
    assertReviewer(token);
    return this.reports.review(id, body);
  }
}

/** 404 rather than 401/403, so the review endpoints don't advertise themselves. */
export function assertReviewer(token: string | undefined, expected = process.env.REPORTS_REVIEW_TOKEN): void {
  if (!expected || !token) throw new NotFoundException();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new NotFoundException();
}
