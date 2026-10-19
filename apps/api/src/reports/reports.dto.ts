import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const REPORT_REASONS = ['INCORRECT_DETAILS', 'BROKEN_CONTACT', 'OUTDATED', 'NOT_OPERATING', 'OTHER'] as const;
export const REPORT_STATUSES = ['NEW', 'ACCEPTED', 'REJECTED'] as const;
export const REPORT_DETAILS_MAX = 1000;

const trimmed = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value);

/** "This information is wrong" — what the public form sends. Nothing identifies the sender. */
export class CreateReportDto {
  @ApiProperty({ description: 'Organization the report is about' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orgSlug!: string;

  @ApiPropertyOptional({ description: 'Program, when reported from a program page' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  programId?: string;

  @ApiProperty({ enum: REPORT_REASONS })
  @IsIn(REPORT_REASONS)
  reason!: (typeof REPORT_REASONS)[number];

  @ApiPropertyOptional({ maxLength: REPORT_DETAILS_MAX, description: 'What is wrong, in the reporter’s words' })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(REPORT_DETAILS_MAX)
  details?: string;
}

export class ReportReceiptDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: REPORT_STATUSES })
  status!: (typeof REPORT_STATUSES)[number];
}

export class ReportDto extends ReportReceiptDto {
  @ApiProperty()
  orgSlug!: string;

  @ApiProperty()
  orgName!: string;

  @ApiProperty({ type: String, nullable: true })
  programId!: string | null;

  @ApiProperty({ enum: REPORT_REASONS })
  reason!: (typeof REPORT_REASONS)[number];

  @ApiProperty({ type: String, nullable: true })
  details!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class ReportListQueryDto {
  @ApiPropertyOptional({ enum: REPORT_STATUSES, default: 'NEW' })
  @IsOptional()
  @IsIn(REPORT_STATUSES)
  status?: (typeof REPORT_STATUSES)[number];
}

export class UpdateReportDto {
  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'], description: 'Accepting a report does not change the data — a person still edits the record' })
  @IsIn(['ACCEPTED', 'REJECTED'])
  status!: 'ACCEPTED' | 'REJECTED';
}
