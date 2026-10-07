import { z } from 'zod';
import type { LocalizedText } from '../../domain/localized';
import { CIRCUMSTANCES, GENDERS, REGIONS, SUPPORT_TYPES, type Circumstance } from '../../domain/vocabulary';
import { matchPrograms, type MatchOutcome } from '../../matching/matching';
import { toMatchable, type ProgramWithOrg } from '../../programs/programs.mapper';
import { SLOTS, repliesFor, type AssistantState, type QuickReplies } from '../engine';
import { confirm, deny, mergeFacts } from '../intent';

/**
 * The tools the Gemini agent works through. The model never sees the database directly and
 * never decides eligibility: it records facts into the structured profile, asks the matching
 * engine, and explains what comes back. Handlers are plain functions over a per-request
 * context (no ADK imports) so they can be tested without calling a model; adk-tools.ts wraps them.
 */
export interface ToolContext {
  state: AssistantState;
  programs: ProgramWithOrg[];
  now: Date;
  locale: string;
  /** Set by search_programs — becomes the result cards the web app shows. */
  results?: MatchOutcome[];
  /** Set by offer_choices — becomes the tappable answers under the reply. */
  quickReplies?: QuickReplies;
}

const MAX_RESULTS = 8;

function title(text: unknown, locale: string): string {
  const t = text as LocalizedText;
  return t[locale as keyof LocalizedText] ?? t.en ?? t.uz ?? t.ru ?? '';
}

// ---- update_profile --------------------------------------------------------------------------

export const updateProfileSchema = z.object({
  needs: z.array(z.enum(SUPPORT_TYPES)).optional().describe('Kinds of support the person asked for'),
  region: z.enum(REGIONS).optional().describe('Region where the person lives'),
  age: z.number().int().min(14).max(99).optional().describe('Exact age, if stated'),
  gender: z.enum(GENDERS).optional().describe('Only if the person stated it or it is unambiguous'),
  childrenCount: z.number().int().min(0).max(20).optional(),
  circumstances: z
    .array(z.enum(CIRCUMSTANCES))
    .optional()
    .describe('Situations the person explicitly said apply to them. Do not infer (e.g. job loss is not "low_income").'),
  notCircumstances: z
    .array(z.enum(CIRCUMSTANCES))
    .optional()
    .describe('Situations the person said do NOT apply (e.g. "I am not a student")'),
});
export type UpdateProfileArgs = z.infer<typeof updateProfileSchema>;

export function handleUpdateProfile(ctx: ToolContext, args: UpdateProfileArgs) {
  const { state } = ctx;
  state.profile = mergeFacts(state.profile, {
    needs: args.needs ?? [],
    region: args.region,
    ageMin: args.age,
    ageMax: args.age,
    gender: args.gender,
    childrenCount: args.childrenCount,
    circumstances: args.circumstances ?? [],
  });
  if (args.childrenCount && args.childrenCount > 0) confirm(state.profile, 'has_children');
  for (const c of args.notCircumstances ?? []) deny(state.profile, c as Circumstance);
  const p = state.profile;
  return {
    profile: p,
    stillUnknown: [
      p.needs.length === 0 && 'kind of support',
      !p.region && 'region',
      p.ageMin === undefined && 'age',
      p.circumstances.length === 0 && p.notCircumstances.length === 0 && 'situation',
    ].filter(Boolean),
  };
}

// ---- search_programs -------------------------------------------------------------------------

export const searchSchema = z.object({
  onlyOpen: z.boolean().optional().describe('Only programs currently accepting applications'),
  womenOnly: z.boolean().optional().describe('Only programs designed specifically for women'),
});
export type SearchArgs = z.infer<typeof searchSchema>;

export function handleSearch(ctx: ToolContext, args: SearchArgs) {
  const { state } = ctx;
  if (args.onlyOpen !== undefined) state.filters.onlyOpen = args.onlyOpen;
  if (args.womenOnly !== undefined) state.filters.womenOnly = args.womenOnly;
  const outcomes = matchPrograms(ctx.programs.map(toMatchable), state.profile, state.filters, ctx.now).slice(0, MAX_RESULTS);
  ctx.results = outcomes;
  state.lastResultIds = outcomes.map((o) => o.programId);
  const byId = new Map(ctx.programs.map((p) => [p.id, p]));
  return {
    count: outcomes.length,
    note: 'The app shows these as cards with reasons. dataOrigin "sample" = invented prototype data; "researched" = collected from a public source but not yet reviewed by a person.',
    results: outcomes.map((o, i) => {
      const program = byId.get(o.programId)!;
      return {
        dataOrigin: program.origin === 'RESEARCHED' ? 'researched' : 'sample',
        position: i + 1,
        programId: o.programId,
        title: title(program.title, ctx.locale),
        organization: program.org.name,
        fit: o.fit,
        supportTypes: program.supportTypes,
        applicationStatus: program.applicationStatus,
        deadline: program.deadline?.toISOString().slice(0, 10) ?? null,
        fits: o.reasons.filter((r) => r.kind === 'yes').map((r) => r.key),
        toCheck: o.reasons.filter((r) => r.kind === 'unknown').map((r) => r.key),
        risks: o.reasons.filter((r) => r.kind === 'risk').map((r) => r.key),
      };
    }),
  };
}

// ---- get_program_details ---------------------------------------------------------------------

export const detailsSchema = z.object({
  programId: z.string().describe('programId from search_programs results'),
});

export function handleDetails(ctx: ToolContext, args: z.infer<typeof detailsSchema>) {
  const program = ctx.programs.find((p) => p.id === args.programId);
  if (!program) return { error: 'No such program. Use a programId from the latest search_programs results.' };
  return {
    programId: program.id,
    title: title(program.title, ctx.locale),
    summary: title(program.summary, ctx.locale),
    howToApply: program.howToApply ? title(program.howToApply, ctx.locale) : null,
    organization: { name: program.org.name, verified: program.org.verification === 'VERIFIED', contactsCollected: Boolean(program.org.website || program.org.phone) },
    eligibility: {
      genders: program.genders.length ? program.genders : 'anyone',
      ageMin: program.ageMin,
      ageMax: program.ageMax,
      regions: program.regions.length ? program.regions : 'nationwide',
      requiredCircumstances: program.requiredCircumstances,
      designedFor: program.targetCircumstances,
      incomeTested: program.incomeTested,
    },
    requiredDocuments: program.requiredDocuments,
    applicationStatus: program.applicationStatus,
    deadline: program.deadline?.toISOString().slice(0, 10) ?? null,
    dataOrigin: program.origin === 'RESEARCHED' ? 'researched' : 'sample',
    sourceUrl: program.sourceUrl,
    note:
      program.origin === 'RESEARCHED'
        ? 'Collected from the public source at sourceUrl; not yet reviewed by a person. Advise confirming with the organization.'
        : 'Sample prototype data invented for the demo, not a real program.',
  };
}

// ---- offer_choices ---------------------------------------------------------------------------

export const offerSchema = z.object({
  question: z.enum(SLOTS).describe('Which tappable answer set to show under your question'),
});

export function handleOfferChoices(ctx: ToolContext, args: z.infer<typeof offerSchema>) {
  ctx.quickReplies = repliesFor(args.question);
  ctx.state.pendingSlot = args.question;
  if (!ctx.state.asked.includes(args.question)) ctx.state.asked.push(args.question);
  return { shown: true, note: 'Buttons are shown under your message. Keep your text to the question itself.' };
}
