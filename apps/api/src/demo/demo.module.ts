import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { ProgramsModule } from '../programs/programs.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  imports: [ProgramsModule, MatchingModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
