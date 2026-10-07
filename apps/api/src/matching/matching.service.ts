import { Inject, Injectable } from '@nestjs/common';
import type { MatchFilters, SupportProfile } from '../domain/profile';
import { toMatchable, toProgramSummary, type ProgramWithOrg } from '../programs/programs.mapper';
import { ProgramsService } from '../programs/programs.service';
import type { MatchResultDto } from './matching.dto';
import { matchPrograms, type MatchOutcome } from './matching';

@Injectable()
export class MatchingService {
  constructor(@Inject(ProgramsService) private readonly programs: ProgramsService) {}

  async match(profile: SupportProfile, filters: MatchFilters = {}, limit = 12): Promise<MatchResultDto[]> {
    const programs = await this.programs.published();
    const outcomes = matchPrograms(programs.map(toMatchable), profile, filters, new Date()).slice(0, limit);
    return decorate(outcomes, programs);
  }
}

/** Attach the program summary to each outcome, keeping the outcome order. */
export function decorate(outcomes: MatchOutcome[], programs: ProgramWithOrg[]): MatchResultDto[] {
  const byId = new Map(programs.map((program) => [program.id, program]));
  return outcomes.flatMap((outcome) => {
    const program = byId.get(outcome.programId);
    return program ? [{ program: toProgramSummary(program), fit: outcome.fit, reasons: outcome.reasons }] : [];
  });
}
