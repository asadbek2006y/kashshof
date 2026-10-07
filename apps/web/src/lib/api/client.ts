import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

/** Browser client: relative URLs through the same-origin proxy (src/proxy.ts). */
export const api = createClient<paths>({ baseUrl: '' });

export type Schemas = components['schemas'];
export type ProgramSummary = Schemas['ProgramSummaryDto'];
export type ProgramDetail = Schemas['ProgramDetailDto'];
export type OrganizationDetail = Schemas['OrganizationDetailDto'];
export type MatchResult = Schemas['MatchResultDto'];
export type MatchReason = Schemas['MatchReasonDto'];
export type SupportProfile = Schemas['SupportProfileDto'];
export type AssistantState = Schemas['AssistantStateDto'];
export type AssistantMessage = Schemas['AssistantMessageDto'];
export type QuickReplies = Schemas['QuickRepliesDto'];
export type TurnResponse = Schemas['AssistantTurnResponseDto'];
export type DemoPersona = Schemas['DemoPersonaDto'];
export type DemoApplication = Schemas['DemoApplicationDto'];
