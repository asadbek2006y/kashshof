import { ApiProperty } from '@nestjs/swagger';
import { MatchResultDto, SupportProfileDto } from '../matching/matching.dto';
import { ProgramSummaryDto } from '../programs/programs.dto';

export class DemoDocumentDto {
  @ApiProperty({ description: 'Document vocabulary value' })
  type!: string;

  @ApiProperty({ enum: ['ready', 'missing'] })
  status!: 'ready' | 'missing';
}

export class DemoApplicationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: ProgramSummaryDto })
  program!: ProgramSummaryDto;

  @ApiProperty({ enum: ['not_started', 'in_progress', 'submitted'] })
  status!: 'not_started' | 'in_progress' | 'submitted';

  @ApiProperty({ description: 'Percent of application steps done (requirements, documents, statement)' })
  progress!: number;

  @ApiProperty({ type: [String] })
  readyDocuments!: string[];

  @ApiProperty({ type: [String] })
  missingDocuments!: string[];
}

export class DemoPersonaDto {
  @ApiProperty({ description: 'Always true — this is fixed demonstration data, not a real account' })
  isDemo!: true;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: SupportProfileDto })
  profile!: SupportProfileDto;

  @ApiProperty({ type: [DemoDocumentDto] })
  documents!: DemoDocumentDto[];

  @ApiProperty({ type: [DemoApplicationDto] })
  applications!: DemoApplicationDto[];

  @ApiProperty({ type: [MatchResultDto], description: 'Matches for the persona not already applied to' })
  recommendations!: MatchResultDto[];
}
