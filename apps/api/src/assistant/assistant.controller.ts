import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AssistantInfoDto, AssistantTurnRequestDto, AssistantTurnResponseDto } from './assistant.dto';
import { AssistantService } from './assistant.service';

@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Get('info')
  @ApiOkResponse({ type: AssistantInfoDto })
  info(): AssistantInfoDto {
    return { aiAvailable: this.assistant.aiAvailable };
  }

  @Post('turn')
  @HttpCode(200)
  @ApiOkResponse({ type: AssistantTurnResponseDto })
  turn(@Body() body: AssistantTurnRequestDto): Promise<AssistantTurnResponseDto> {
    return this.assistant.turn(body);
  }
}
