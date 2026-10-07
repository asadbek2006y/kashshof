import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DOCUMENTS, GENDERS, LOCALES, REGIONS, SUPPORT_TYPES } from '../domain/vocabulary';
import { APPLICATION_STATUS } from '../programs/programs.dto';

/**
 * The organization dashboard's "new program" form. Every field is structured on purpose —
 * these values are exactly what the matching engine searches.
 */
export class CreateProgramDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orgSlug!: string;

  @ApiProperty({ enum: LOCALES, description: 'Language the title and description are written in' })
  @IsIn(LOCALES)
  locale!: (typeof LOCALES)[number];

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  summary!: string;

  @ApiProperty({ enum: SUPPORT_TYPES, isArray: true })
  @IsArray()
  @ArrayMaxSize(SUPPORT_TYPES.length)
  @IsIn(SUPPORT_TYPES, { each: true })
  supportTypes!: string[];

  @ApiProperty({ enum: GENDERS, isArray: true, description: 'Empty = anyone' })
  @IsArray()
  @IsIn(GENDERS, { each: true })
  genders!: string[];

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

  @ApiProperty({ enum: REGIONS, isArray: true, description: 'Empty = nationwide' })
  @IsArray()
  @IsIn(REGIONS, { each: true })
  regions!: string[];

  @ApiProperty({ enum: DOCUMENTS, isArray: true })
  @IsArray()
  @IsIn(DOCUMENTS, { each: true })
  requiredDocuments!: string[];

  @ApiProperty({ enum: APPLICATION_STATUS })
  @IsIn(APPLICATION_STATUS)
  applicationStatus!: (typeof APPLICATION_STATUS)[number];

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
