import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantModule } from './assistant/assistant.module';
import { DemoModule } from './demo/demo.module';
import { HealthController } from './health/health.controller';
import { MatchingModule } from './matching/matching.module';
import { OrgModule } from './org/org.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramsModule } from './programs/programs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProgramsModule,
    MatchingModule,
    AssistantModule,
    DemoModule,
    OrgModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
