import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MatchFiltersDto, MatchResultDto, SupportProfileDto } from '../matching/matching.dto';
import { LOCALES } from '../domain/vocabulary';
import { SLOTS } from './engine';

const REPLY_SLOTS = [...SLOTS, 'safety', 'next'] as const;
const MODES = ['chat', 'results', 'safety'] as const;
const LIST_KINDS = ['need', 'document', 'circumstance'] as const;
export const ASSISTANT_MODES = ['ai', 'private'] as const;

export class HistoryItemDto {
  @ApiProperty({ enum: ['user', 'model'] })
  @IsIn(['user', 'model'])
  role!: 'user' | 'model';

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  text!: string;
}

/** The whole conversation state — round-tripped by the browser, never stored on the server. */
export class AssistantStateDto {
  @ApiProperty({ type: SupportProfileDto })
  @ValidateNested()
  @Type(() => SupportProfileDto)
  profile!: SupportProfileDto;

  @ApiProperty({ enum: MODES })
  @IsIn(MODES)
  mode!: (typeof MODES)[number];

  @ApiProperty({ enum: SLOTS, isArray: true })
  @IsArray()
  @IsIn(SLOTS, { each: true })
  asked!: (typeof SLOTS)[number][];

  @ApiProperty({ enum: SLOTS, isArray: true })
  @IsArray()
  @IsIn(SLOTS, { each: true })
  retried!: (typeof SLOTS)[number][];

  @ApiPropertyOptional({ enum: SLOTS })
  @IsOptional()
  @IsIn(SLOTS)
  pendingSlot?: (typeof SLOTS)[number];

  @ApiProperty({ type: MatchFiltersDto })
  @ValidateNested()
  @Type(() => MatchFiltersDto)
  filters!: MatchFiltersDto;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  lastResultIds!: string[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  turn!: number;

  @ApiPropertyOptional({ type: [HistoryItemDto], description: 'Recent turns, for the LLM engine' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => HistoryItemDto)
  history?: HistoryItemDto[];
}

export class AssistantChoiceDto {
  @ApiProperty({ enum: REPLY_SLOTS })
  @IsIn(REPLY_SLOTS)
  slot!: (typeof REPLY_SLOTS)[number];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  values!: string[];
}

export class AssistantTurnRequestDto {
  @ApiPropertyOptional({ type: AssistantStateDto, description: 'Omit to start a new conversation' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssistantStateDto)
  state?: AssistantStateDto;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @ApiPropertyOptional({ enum: LOCALES, description: 'Language the assistant should answer in' })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: (typeof LOCALES)[number];

  @ApiPropertyOptional({ type: AssistantChoiceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssistantChoiceDto)
  choice?: AssistantChoiceDto;

  @ApiPropertyOptional({
    enum: ASSISTANT_MODES,
    description: '"private" never sends the turn to a language model (scripted engine only). Defaults to "ai".',
  })
  @IsOptional()
  @IsIn(ASSISTANT_MODES)
  assistantMode?: (typeof ASSISTANT_MODES)[number];
}

export class AssistantInfoDto {
  @ApiProperty({ description: 'Whether the AI-assisted (Gemini) mode is configured on this server' })
  aiAvailable!: boolean;
}

export class AssistantMessageDto {
  @ApiProperty({ description: 'i18n key under "assistant." in the web app ("llm" when `text` is set)' })
  key!: string;

  @ApiPropertyOptional({ description: 'Free text from the Gemini engine, already in the requested language' })
  text?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }] },
  })
  params?: Record<string, string | number>;

  @ApiPropertyOptional({ type: [String] })
  list?: string[];

  @ApiPropertyOptional({ enum: LIST_KINDS })
  listKind?: (typeof LIST_KINDS)[number];

  @ApiPropertyOptional()
  programId?: string;
}

export class QuickReplyOptionDto {
  @ApiProperty()
  value!: string;

  @ApiProperty({ description: 'i18n key under "assistant." in the web app' })
  labelKey!: string;

  @ApiPropertyOptional()
  href?: string;
}

export class QuickRepliesDto {
  @ApiProperty({ enum: REPLY_SLOTS })
  slot!: (typeof REPLY_SLOTS)[number];

  @ApiProperty()
  multi!: boolean;

  @ApiProperty({ type: [QuickReplyOptionDto] })
  options!: QuickReplyOptionDto[];
}

export class AssistantTurnResponseDto {
  @ApiProperty({ type: AssistantStateDto })
  state!: AssistantStateDto;

  @ApiProperty({ enum: ['gemini', 'scripted'], description: 'Which assistant engine produced this turn' })
  engine!: 'gemini' | 'scripted';

  @ApiProperty({ type: [AssistantMessageDto] })
  messages!: AssistantMessageDto[];

  @ApiPropertyOptional({ type: QuickRepliesDto })
  quickReplies?: QuickRepliesDto;

  @ApiPropertyOptional({ type: [MatchResultDto], description: 'Present when the assistant shows results' })
  results?: MatchResultDto[];
}
