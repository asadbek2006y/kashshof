import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { LocalizedTextDto } from '../common/localized-text.dto';
import { DIRECTORY_SECTIONS, LISTED_KINDS, REGIONS, SUPPORT_TYPES } from '../domain/vocabulary';

export { DIRECTORY_SECTIONS, LISTED_KINDS };

export const VERIFICATION = ['VERIFIED', 'UNVERIFIED'] as const;
export const APPLICATION_STATUS = ['OPEN', 'CLOSED', 'UNKNOWN'] as const;

export class OrganizationRefDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: VERIFICATION })
  verification!: (typeof VERIFICATION)[number];
}

export class ProgramSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: LocalizedTextDto })
  title!: LocalizedTextDto;

  @ApiProperty({ type: LocalizedTextDto })
  summary!: LocalizedTextDto;

  @ApiProperty({ type: [String], description: 'Support type vocabulary values' })
  supportTypes!: string[];

  @ApiProperty({ type: [String] })
  genders!: string[];

  @ApiProperty({ type: [String], description: 'Document vocabulary values' })
  requiredDocuments!: string[];

  @ApiProperty({ enum: APPLICATION_STATUS })
  applicationStatus!: (typeof APPLICATION_STATUS)[number];

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  deadline!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  statusVerifiedAt!: string | null;

  @ApiProperty()
  isDraft!: boolean;

  @ApiProperty({ enum: ['SAMPLE', 'RESEARCHED'], description: 'SAMPLE = invented prototype data; RESEARCHED = collected from a public source' })
  origin!: 'SAMPLE' | 'RESEARCHED';

  @ApiProperty({ type: String, nullable: true, description: 'Page the program information was collected from' })
  sourceUrl!: string | null;

  @ApiProperty({ type: [String], description: 'Region vocabulary values; empty means nationwide' })
  regions!: string[];

  @ApiProperty({ type: [String], description: 'Circumstance vocabulary values the program is designed for' })
  targetCircumstances!: string[];

  @ApiProperty({ type: OrganizationRefDto })
  organization!: OrganizationRefDto;
}

export class ProgramDetailDto extends ProgramSummaryDto {
  @ApiPropertyOptional({ type: LocalizedTextDto, nullable: true })
  howToApply!: LocalizedTextDto | null;

  @ApiProperty({ type: Number, nullable: true })
  ageMin!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  ageMax!: number | null;

  @ApiProperty({ type: [String] })
  requiredCircumstances!: string[];

  @ApiProperty()
  incomeTested!: boolean;

  @ApiProperty({ description: 'Where the information came from' })
  source!: string;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  researchedAt!: string | null;
}

export class OrganizationDetailDto extends OrganizationRefDto {
  @ApiProperty({ type: LocalizedTextDto })
  description!: LocalizedTextDto;

  @ApiProperty({ type: [String] })
  categories!: string[];

  @ApiProperty({ enum: DIRECTORY_SECTIONS, isArray: true })
  sections!: string[];

  @ApiProperty({ enum: LISTED_KINDS })
  kind!: (typeof LISTED_KINDS)[number];

  @ApiProperty({ type: String, nullable: true })
  website!: string | null;

  @ApiProperty({ type: String, nullable: true })
  phone!: string | null;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty()
  source!: string;

  @ApiProperty({ type: String, nullable: true })
  sourceUrl!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time', description: 'When information was collected from sourceUrl' })
  researchedAt!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  lastVerifiedAt!: string | null;

  @ApiProperty({ type: [ProgramSummaryDto] })
  programs!: ProgramSummaryDto[];
}

export class ProgramListQueryDto {
  @ApiPropertyOptional({ enum: SUPPORT_TYPES })
  @IsOptional()
  @IsIn(SUPPORT_TYPES)
  supportType?: string;

  @ApiPropertyOptional({ enum: REGIONS })
  @IsOptional()
  @IsIn(REGIONS)
  region?: string;

  @ApiPropertyOptional({ description: 'Only programs currently accepting applications' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  open?: boolean;

  @ApiPropertyOptional({ description: 'Organization slug' })
  @IsOptional()
  @IsString()
  org?: string;
}

export class OrganizationListQueryDto {
  @ApiPropertyOptional({ enum: DIRECTORY_SECTIONS })
  @IsOptional()
  @IsIn(DIRECTORY_SECTIONS)
  section?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive name search', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
