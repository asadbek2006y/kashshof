import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MatchRequestDto, MatchResultDto } from './matching.dto';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@Controller('matches')
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  /** Stateless: the profile is sent with each request and never stored. */
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: [MatchResultDto] })
  match(@Body() body: MatchRequestDto): Promise<MatchResultDto[]> {
    return this.matching.match(body.profile, body.filters);
  }
}
