import { emptyProfile, type MatchFilters, type SupportProfile } from '../domain/profile';
import {
  AGE_BANDS,
  REGIONS,
  type AgeBand,
  type Circumstance,
  type Region,
  type SupportType,
} from '../domain/vocabulary';
import type { MatchOutcome } from '../matching/matching';
import { confirm, deny, extractFacts, hasFacts, mergeFacts } from './intent';
import { parseRefinement } from './refine';
import { detectSafetyConcern } from './safety';

/**
 * The scripted assistant: a slot-filling conversation that asks only for what it doesn't know
 * yet, prefers tappable answers over typing, and hands over to the matching engine as soon as
 * it has enough. It never decides eligibility and never produces free text — every message is
 * an i18n key the web app renders in the person's language.
 *
 * Stateless on the server: the full conversation state travels with each request and lives in
 * the browser's sessionStorage only, so nothing about the person is stored unless they choose to.
 */

export const SLOTS = ['need', 'region', 'age', 'situation'] as const;
export type Slot = (typeof SLOTS)[number];
export type ReplySlot = Slot | 'safety' | 'next';
export type Mode = 'chat' | 'results' | 'safety';

export const SKIP = '__skip';
export const NEED_OPTIONS: SupportType[] = [
  'financial', 'education', 'food', 'health', 'maternity', 'children_family',
  'employment', 'business', 'housing', 'legal', 'mental_wellbeing', 'disability',
];
export const SITUATION_OPTIONS: Circumstance[] = [
  'student', 'employed', 'unemployed', 'single_parent', 'pregnant', 'disability',
];
export const SITUATION_NONE = 'none';
export const SAFETY_OPTIONS = ['find_services', 'emergency_info', 'continue_privately'] as const;
export const NEXT_OPTIONS = ['only_open', 'women_only', 'add_need', 'restart'] as const;

const MAX_RESULTS = 8;

/** One prior turn, kept only so an LLM engine can see the conversation. Never stored server-side. */
export interface HistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface AssistantState {
  profile: SupportProfile;
  mode: Mode;
  asked: Slot[];
  retried: Slot[];
  pendingSlot?: Slot;
  filters: MatchFilters;
  lastResultIds: string[];
  turn: number;
  history?: HistoryItem[];
}

export interface AssistantInput {
  text?: string;
  choice?: { slot: ReplySlot; values: string[] };
}

export interface AssistantMessage {
  key: string;
  /** Free text written by the LLM engine (already in the person's language). */
  text?: string;
  params?: Record<string, string | number>;
  /** Vocabulary values the web app renders as a translated list (needs, documents, …). */
  list?: string[];
  listKind?: 'need' | 'document' | 'circumstance';
  programId?: string;
}

export interface QuickReplyOption {
  value: string;
  labelKey: string;
  /** Navigates in the web app instead of sending a turn (e.g. the safety information page). */
  href?: string;
}

export interface QuickReplies {
  slot: ReplySlot;
  multi: boolean;
  options: QuickReplyOption[];
}

export interface TurnResult {
  state: AssistantState;
  messages: AssistantMessage[];
  quickReplies?: QuickReplies;
  outcomes?: MatchOutcome[];
}

export interface EngineDeps {
  match: (profile: SupportProfile, filters: MatchFilters) => MatchOutcome[];
  documentsFor: (programId: string) => string[] | undefined;
}

export function initialState(): AssistantState {
  return { profile: emptyProfile(), mode: 'chat', asked: [], retried: [], filters: {}, lastResultIds: [], turn: 0 };
}

function cloneState(state: AssistantState): AssistantState {
  return structuredClone(state);
}

function nextSlot(state: AssistantState): Slot | undefined {
  const { profile, asked } = state;
  const missing: Record<Slot, boolean> = {
    need: profile.needs.length === 0,
    region: !profile.region,
    age: profile.ageMin === undefined,
    situation: profile.circumstances.length === 0 && profile.notCircumstances.length === 0,
  };
  return SLOTS.find((slot) => missing[slot] && !asked.includes(slot));
}

function skipOption(): QuickReplyOption {
  return { value: SKIP, labelKey: 'reply.skip' };
}

export function repliesFor(slot: Slot): QuickReplies {
  switch (slot) {
    case 'need':
      return {
        slot,
        multi: true,
        options: NEED_OPTIONS.map((value) => ({ value, labelKey: `need.${value}` })),
      };
    case 'region':
      return {
        slot,
        multi: false,
        options: [...REGIONS.map((value) => ({ value, labelKey: `region.${value}` })), skipOption()],
      };
    case 'age':
      return {
        slot,
        multi: false,
        options: [
          ...Object.keys(AGE_BANDS).map((value) => ({ value, labelKey: `ageBand.${value}` })),
          { value: SKIP, labelKey: 'reply.preferNotToSay' },
        ],
      };
    case 'situation':
      return {
        slot,
        multi: true,
        options: [
          ...SITUATION_OPTIONS.map((value) => ({ value, labelKey: `situation.${value}` })),
          { value: SITUATION_NONE, labelKey: 'situation.none' },
        ],
      };
  }
}

export function safetyReplies(): QuickReplies {
  return {
    slot: 'safety',
    multi: false,
    options: [
      { value: 'find_services', labelKey: 'safety.findServices' },
      { value: 'emergency_info', labelKey: 'safety.emergencyInfo', href: '/safety' },
      { value: 'continue_privately', labelKey: 'safety.continuePrivately' },
    ],
  };
}

export function nextReplies(state: AssistantState): QuickReplies {
  const options: QuickReplyOption[] = [];
  if (!state.filters.onlyOpen) options.push({ value: 'only_open', labelKey: 'next.onlyOpen' });
  if (!state.filters.womenOnly) options.push({ value: 'women_only', labelKey: 'next.womenOnly' });
  options.push({ value: 'add_need', labelKey: 'next.addNeed' });
  options.push({ value: 'restart', labelKey: 'next.restart' });
  return { slot: 'next', multi: false, options };
}

export function applyChoice(state: AssistantState, slot: Slot, values: string[]): void {
  const { profile } = state;
  const real = values.filter((v) => v !== SKIP);
  switch (slot) {
    case 'need': {
      const needs = real.filter((v): v is SupportType => (NEED_OPTIONS as string[]).includes(v));
      profile.needs = [...new Set([...profile.needs, ...needs])];
      break;
    }
    case 'region':
      if (real[0] && (REGIONS as readonly string[]).includes(real[0])) profile.region = real[0] as Region;
      break;
    case 'age': {
      const band = AGE_BANDS[real[0] as AgeBand];
      if (band) {
        profile.ageMin = band.min;
        profile.ageMax = band.max;
      }
      break;
    }
    case 'situation': {
      if (real.includes(SITUATION_NONE)) {
        for (const c of SITUATION_OPTIONS) if (c !== 'employed' && c !== 'unemployed') deny(profile, c);
        break;
      }
      const chosen = real.filter((v): v is Circumstance => (SITUATION_OPTIONS as string[]).includes(v));
      for (const c of chosen) confirm(profile, c);
      if (chosen.includes('single_parent')) confirm(profile, 'has_children');
      if (chosen.includes('pregnant')) profile.gender = 'female';
      // The person saw these options and didn't pick them — that's an answer, not a gap.
      for (const c of ['student', 'single_parent', 'pregnant', 'disability'] as Circumstance[]) {
        if (!chosen.includes(c)) deny(profile, c);
      }
      break;
    }
  }
}

function ask(state: AssistantState, slot: Slot, messages: AssistantMessage[], retry = false): TurnResult {
  state.pendingSlot = slot;
  messages.push({ key: retry ? `ask.${slot}Retry` : `ask.${slot}` });
  return { state, messages, quickReplies: repliesFor(slot) };
}

function showResults(
  state: AssistantState,
  messages: AssistantMessage[],
  deps: EngineDeps,
  leadKey?: string,
): TurnResult {
  const outcomes = deps.match(state.profile, state.filters).slice(0, MAX_RESULTS);
  state.mode = 'results';
  state.pendingSlot = undefined;
  state.lastResultIds = outcomes.map((o) => o.programId);
  if (leadKey) messages.push({ key: leadKey });
  messages.push(
    outcomes.length > 0
      ? { key: 'results.found', params: { count: outcomes.length } }
      : { key: 'results.none' },
  );
  if (outcomes.length > 0) messages.push({ key: 'results.followUp' });
  return { state, messages, quickReplies: nextReplies(state), outcomes };
}

/** Continue intake: acknowledge, ask the next missing thing, or show results. */
function proceed(state: AssistantState, messages: AssistantMessage[], deps: EngineDeps): TurnResult {
  const slot = nextSlot(state);
  if (!slot) return showResults(state, messages, deps);
  // Once we know the need, say how many programs are already in view — the person should feel
  // progress, not an interrogation.
  if (slot !== 'need' && state.profile.needs.length > 0 && !state.asked.length && state.turn === 1) {
    const count = deps.match(state.profile, state.filters).length;
    if (count > 0) messages.push({ key: 'intake.preview', params: { count } });
  }
  return ask(state, slot, messages);
}

function handleText(state: AssistantState, text: string, deps: EngineDeps): TurnResult {
  const messages: AssistantMessage[] = [];

  if (detectSafetyConcern(text)) {
    state.mode = 'safety';
    state.pendingSlot = undefined;
    confirm(state.profile, 'survivor');
    messages.push({ key: 'safety.intro' });
    return { state, messages, quickReplies: safetyReplies() };
  }

  if (state.mode === 'results') {
    const refinement = parseRefinement(text);
    if (refinement?.type === 'restart') return restart();
    if (refinement?.type === 'womenOnly') {
      state.filters.womenOnly = true;
      return showResults(state, messages, deps, 'refined.womenOnly');
    }
    if (refinement?.type === 'onlyOpen') {
      state.filters.onlyOpen = true;
      return showResults(state, messages, deps, 'refined.onlyOpen');
    }
    if (refinement?.type === 'documents') {
      const programId = state.lastResultIds[refinement.index];
      const documents = programId ? deps.documentsFor(programId) : undefined;
      if (!programId || !documents) {
        messages.push({ key: 'docs.none', params: { position: refinement.index + 1 } });
      } else {
        messages.push({ key: 'docs.list', programId, list: documents, listKind: 'document' });
      }
      return { state, messages, quickReplies: nextReplies(state) };
    }
  }

  // A bare number while we're asking for age ("23").
  const facts = extractFacts(text);
  if (state.pendingSlot === 'age' && facts.ageMin === undefined) {
    const bare = text.trim().match(/^(\d{1,2})$/);
    const age = bare ? Number(bare[1]) : NaN;
    if (age >= 14 && age <= 99) {
      facts.ageMin = age;
      facts.ageMax = age;
    }
  }

  const understood = hasFacts(facts);
  const before = nextSlot(state);
  state.profile = mergeFacts(state.profile, facts);

  if (state.mode === 'results') {
    if (!understood) {
      messages.push({ key: 'results.notUnderstood' });
      return { state, messages, quickReplies: nextReplies(state) };
    }
    return showResults(state, messages, deps, 'results.updated');
  }
  state.mode = 'chat';

  if (state.turn === 1 && state.profile.needs.length > 0) {
    messages.push({ key: 'intake.ack', list: state.profile.needs, listKind: 'need' });
  }

  // They typed instead of tapping and it didn't answer the question: ask once more, then move on.
  const pending = state.pendingSlot;
  if (pending && before === pending && nextSlot(state) === pending) {
    if (!state.retried.includes(pending)) {
      state.retried.push(pending);
      return ask(state, pending, messages, true);
    }
    state.asked.push(pending);
  } else if (pending && !state.asked.includes(pending)) {
    state.asked.push(pending);
  }

  if (!understood && state.turn === 1) messages.push({ key: 'intake.notUnderstood' });
  return proceed(state, messages, deps);
}

function restart(): TurnResult {
  const state = initialState();
  state.turn = 1;
  return ask(state, 'need', [{ key: 'restart.done' }]);
}

function handleChoice(
  state: AssistantState,
  choice: NonNullable<AssistantInput['choice']>,
  deps: EngineDeps,
): TurnResult {
  const messages: AssistantMessage[] = [];
  const value = choice.values[0];

  if (choice.slot === 'safety') {
    if (value === 'find_services') {
      state.profile.needs = [...new Set<SupportType>([...state.profile.needs, 'safety', 'legal', 'housing', 'mental_wellbeing'])];
      return showResults(state, messages, deps, 'safety.servicesLead');
    }
    // continue_privately (emergency_info is a link and never reaches the server).
    state.mode = 'chat';
    messages.push({ key: 'safety.continuing' });
    return proceed(state, messages, deps);
  }

  if (choice.slot === 'next') {
    switch (value) {
      case 'only_open':
        state.filters.onlyOpen = true;
        return showResults(state, messages, deps, 'refined.onlyOpen');
      case 'women_only':
        state.filters.womenOnly = true;
        return showResults(state, messages, deps, 'refined.womenOnly');
      case 'add_need':
        state.mode = 'chat';
        state.asked = state.asked.filter((s) => s !== 'need');
        return ask(state, 'need', messages);
      case 'restart':
        return restart();
      default:
        return { state, messages: [{ key: 'results.notUnderstood' }], quickReplies: nextReplies(state) };
    }
  }

  applyChoice(state, choice.slot, choice.values);
  if (!state.asked.includes(choice.slot)) state.asked.push(choice.slot);
  state.pendingSlot = undefined;

  // Adding a need from the results view goes straight back to results.
  if (choice.slot === 'need' && state.lastResultIds.length > 0) {
    return showResults(state, messages, deps, 'results.updated');
  }
  return proceed(state, messages, deps);
}

export function runTurn(previous: AssistantState | undefined, input: AssistantInput, deps: EngineDeps): TurnResult {
  const state = cloneState(previous ?? initialState());
  state.turn += 1;

  if (input.choice) return handleChoice(state, input.choice, deps);
  if (input.text && input.text.trim()) return handleText(state, input.text, deps);

  // Empty first turn — open the conversation.
  return ask(state, 'need', [{ key: 'intake.greeting' }]);
}
