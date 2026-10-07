import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CIRCUMSTANCES, GENDERS, REGIONS, SUPPORT_TYPES } from '../domain/vocabulary';
import { ProgramSummaryDto } from '../programs/programs.dto';

export class SupportProfileDto {
  @ApiProperty({ enum: SUPPORT_TYPES, isArray: true })
  @IsArray()
  @ArrayMaxSize(SUPPORT_TYPES.length)
  @IsIn(SUPPORT_TYPES, { each: true })
  needs!: (typeof SUPPORT_TYPES)[number][];

  @ApiPropertyOptional({ enum: REGIONS })
  @IsOptional()
  @IsIn(REGIONS)
  region?: (typeof REGIONS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  ageMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  ageMax?: number;

  @ApiPropertyOptional({ enum: GENDERS })
  @IsOptional()
  @IsIn(GENDERS)
  gender?: (typeof GENDERS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  childrenCount?: number;

  @ApiProperty({ enum: CIRCUMSTANCES, isArray: true })
  @IsArray()
  @ArrayMaxSize(CIRCUMSTANCES.length)
  @IsIn(CIRCUMSTANCES, { each: true })
  circumstances!: (typeof CIRCUMSTANCES)[number][];

  @ApiProperty({ enum: CIRCUMSTANCES, isArray: true })
  @IsArray()
  @ArrayMaxSize(CIRCUMSTANCES.length)
  @IsIn(CIRCUMSTANCES, { each: true })
  notCircumstances!: (typeof CIRCUMSTANCES)[number][];
}

export class MatchFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onlyOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  womenOnly?: boolean;
}

export class MatchRequestDto {
  @ApiProperty({ type: SupportProfileDto })
  @ValidateNested()
  @Type(() => SupportProfileDto)
  profile!: SupportProfileDto;

  @ApiPropertyOptional({ type: MatchFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MatchFiltersDto)
  filters?: MatchFiltersDto;
}

export class MatchReasonDto {
  @ApiProperty({ enum: ['yes', 'unknown', 'risk'] })
  kind!: 'yes' | 'unknown' | 'risk';

  @ApiProperty({ description: 'i18n key under "reasons." in the web app' })
  key!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: { type: 'string' } })
  params?: Record<string, string>;
}

export class MatchResultDto {
  @ApiProperty({ type: ProgramSummaryDto })
  program!: ProgramSummaryDto;

  @ApiProperty({ enum: ['strong', 'possible', 'needs_info'] })
  fit!: 'strong' | 'possible' | 'needs_info';

  @ApiProperty({ type: [MatchReasonDto] })
  reasons!: MatchReasonDto[];
}
