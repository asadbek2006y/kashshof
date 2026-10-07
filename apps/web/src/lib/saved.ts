import type { ProgramSummary } from './api/client';

/** What we keep about a saved program — public program data only, enough to render the Saved page. */
export type SavedProgram = Pick<ProgramSummary, 'id' | 'title' | 'supportTypes' | 'applicationStatus' | 'deadline'> & {
  orgName: string;
};

export function toSaved(program: ProgramSummary): SavedProgram {
  return {
    id: program.id,
    title: program.title,
    supportTypes: program.supportTypes,
    applicationStatus: program.applicationStatus,
    deadline: program.deadline,
    orgName: program.organization.name,
  };
}
