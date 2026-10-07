import { Injectable } from '@nestjs/common';
import type { SupportProfile } from '../domain/profile';
import { MatchingService } from '../matching/matching.service';
import { toProgramSummary } from '../programs/programs.mapper';
import { ProgramsService } from '../programs/programs.service';
import type { DemoApplicationDto, DemoDocumentDto, DemoPersonaDto } from './demo.dto';

/**
 * A fixed demonstration persona for the signed-in screens (dashboard, applications, profile).
 * The prototype has no accounts; the web app labels every screen that uses this as demo data.
 * Applications point at real seeded programs so documents and deadlines stay consistent with
 * the rest of the app.
 */
const PROFILE: SupportProfile = {
  needs: ['education', 'financial', 'children_family'],
  region: 'tashkent_city',
  ageMin: 23,
  ageMax: 23,
  gender: 'female',
  childrenCount: 1,
  circumstances: ['student', 'has_children', 'low_income'],
  notCircumstances: ['employed'],
};

const READY_DOCUMENTS = ['id_document', 'enrollment_certificate', 'birth_certificate'];

const APPLICATIONS: { id: string; programId: string; status: DemoApplicationDto['status']; statementDone: boolean }[] = [
  // Real (researched) programs, so the demo never shows an invented one.
  { id: 'app-child-benefit', programId: 'ihma-child-benefit', status: 'in_progress', statementDone: true },
  { id: 'app-ezgu-amal', programId: 'ezgu-amal-hand-to-hand', status: 'not_started', statementDone: false },
];

@Injectable()
export class DemoService {
  constructor(
    private readonly programs: ProgramsService,
    private readonly matching: MatchingService,
  ) {}

  async persona(): Promise<DemoPersonaDto> {
    const published = await this.programs.published();
    const byId = new Map(published.map((program) => [program.id, program]));

    const applications: DemoApplicationDto[] = APPLICATIONS.flatMap((app) => {
      const program = byId.get(app.programId);
      if (!program) return [];
      const ready = program.requiredDocuments.filter((d) => READY_DOCUMENTS.includes(d));
      const missing = program.requiredDocuments.filter((d) => !READY_DOCUMENTS.includes(d));
      // Steps: requirements reviewed (1) + each document + personal statement (1).
      const total = program.requiredDocuments.length + 2;
      const done = app.status === 'not_started' ? 0 : 1 + ready.length + (app.statementDone ? 1 : 0);
      return [
        {
          id: app.id,
          program: toProgramSummary(program),
          status: app.status,
          progress: Math.round((done / total) * 100),
          readyDocuments: ready,
          missingDocuments: missing,
        },
      ];
    });

    const documentTypes = [...new Set([...READY_DOCUMENTS, 'income_certificate', 'medical_report'])];
    const documents: DemoDocumentDto[] = documentTypes.map((type) => ({
      type,
      status: READY_DOCUMENTS.includes(type) ? 'ready' : 'missing',
    }));

    const applied = new Set(APPLICATIONS.map((a) => a.programId));
    const recommendations = (await this.matching.match(PROFILE, { onlyOpen: true }))
      .filter((match) => !applied.has(match.program.id))
      .slice(0, 2);

    return { isDemo: true, name: 'Malika', profile: PROFILE, documents, applications, recommendations };
  }
}
