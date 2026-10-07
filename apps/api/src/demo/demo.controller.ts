import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DemoPersonaDto } from './demo.dto';
import { DemoService } from './demo.service';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Get('persona')
  @ApiOkResponse({ type: DemoPersonaDto })
  persona(): Promise<DemoPersonaDto> {
    return this.demo.persona();
  }
}
