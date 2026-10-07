import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Organization details collected from public sources (official websites, government portals,
 * UN pages, reputable news) — see prisma/research/organizations.json. Every fact has a source
 * URL. Nothing here is "verified": a person still has to review it before an organization can be
 * marked VERIFIED.
 */
type L = { uz: string; ru: string; en: string };

export interface ResearchedProgram {
  id: string;
  title: L;
  summary: L;
  howToApply: L | null;
  supportTypes: string[];
  genders: string[];
  ageMin: number | null;
  ageMax: number | null;
  regions: string[];
  targetCircumstances: string[];
  requiredCircumstances: string[];
  incomeTested: boolean;
  requiredDocuments: string[];
  applicationStatus: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  deadline: string | null;
  sourceUrl: string;
  /** Short verbatim quote from sourceUrl supporting the entry — for reviewers, not shown. */
  evidenceQuote?: string;
  statusNote?: string | null;
}

export interface ResearchedOrganization {
  slug: string;
  /** Couldn't confirm the organization exists or operates — hide it from people. */
  hidden: boolean;
  /** Why it's hidden, or anything a reviewer should know. */
  reviewNote: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  description: L | null;
  /** Main page the organization's information came from. */
  sourceUrl: string | null;
  programs: ResearchedProgram[];
}

export interface ResearchFile {
  collectedAt: string;
  organizations: ResearchedOrganization[];
}

export const RESEARCH_SOURCE = 'Collected from public sources — not yet reviewed by a person';

const FILE = resolve(__dirname, 'research/organizations.json');

export function loadResearch(): ResearchFile | null {
  if (!existsSync(FILE)) return null;
  return JSON.parse(readFileSync(FILE, 'utf-8')) as ResearchFile;
}
