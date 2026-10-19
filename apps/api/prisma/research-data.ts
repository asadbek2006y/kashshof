import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { HumanReview } from '../src/domain/verification';

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
  /** Office address, only when an official page states it. */
  address?: string | null;
  description: L | null;
  /** Main page the organization's information came from. */
  sourceUrl: string | null;
  /** The source site's name ("Gazeta.uz"); defaults to the URL's host. */
  sourceName?: string | null;
  /** Short verbatim quote from sourceUrl supporting the description — for reviewers, not shown. */
  evidenceQuote?: string | null;
  /** When this entry was collected, if later than the file's collectedAt. */
  checkedAt?: string;
  /**
   * A person's review against the source. Only this makes an organization VERIFIED — add it after
   * confirming the details (ideally with the organization itself), never from research alone.
   */
  review?: HumanReview | null;
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
