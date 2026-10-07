import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProgramDetailDto } from '../programs/programs.dto';
import { CreateProgramDto } from './org.dto';
import { OrgService } from './org.service';

/**
 * Organization dashboard endpoints. The prototype has no organization accounts, so these are
 * open — acceptable only because drafts are never published or matched.
 */
@ApiTags('org')
@Controller('org/programs')
export class OrgController {
  constructor(private readonly org: OrgService) {}

  @Get()
  @ApiOkResponse({ type: [ProgramDetailDto] })
  drafts(): Promise<ProgramDetailDto[]> {
    return this.org.drafts();
  }

  @Post()
  @ApiCreatedResponse({ type: ProgramDetailDto })
  create(@Body() body: CreateProgramDto): Promise<ProgramDetailDto> {
    return this.org.createDraft(body);
  }
}
