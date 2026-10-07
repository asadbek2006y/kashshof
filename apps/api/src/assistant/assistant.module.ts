import { Module } from '@nestjs/common';
import { ProgramsModule } from '../programs/programs.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';

@Module({
  imports: [ProgramsModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
