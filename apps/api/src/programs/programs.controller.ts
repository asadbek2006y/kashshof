import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  OrganizationDetailDto,
  OrganizationListQueryDto,
  ProgramDetailDto,
  ProgramListQueryDto,
  ProgramSummaryDto,
} from './programs.dto';
import { ProgramsService } from './programs.service';

@ApiTags('programs')
@Controller()
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get('programs')
  @ApiOkResponse({ type: [ProgramSummaryDto] })
  list(@Query() query: ProgramListQueryDto): Promise<ProgramSummaryDto[]> {
    return this.programs.list(query);
  }

  @Get('programs/:id')
  @ApiOkResponse({ type: ProgramDetailDto })
  @ApiNotFoundResponse()
  get(@Param('id') id: string): Promise<ProgramDetailDto> {
    return this.programs.get(id);
  }

  @Get('organizations')
  @ApiOkResponse({ type: [OrganizationDetailDto] })
  organizations(@Query() query: OrganizationListQueryDto): Promise<OrganizationDetailDto[]> {
    return this.programs.listOrganizations(query);
  }

  @Get('organizations/:slug')
  @ApiOkResponse({ type: OrganizationDetailDto })
  @ApiNotFoundResponse()
  organization(@Param('slug') slug: string): Promise<OrganizationDetailDto> {
    return this.programs.getOrganization(slug);
  }
}
