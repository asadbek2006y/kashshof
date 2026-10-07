import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decorate } from '../matching/matching.service';
import { matchPrograms } from '../matching/matching';
import { toMatchable } from '../programs/programs.mapper';
import { ProgramsService } from '../programs/programs.service';
import { runGeminiTurn, type GeminiConfig } from './agent/gemini-assistant';
import type { AssistantTurnRequestDto, AssistantTurnResponseDto } from './assistant.dto';
import { runTurn, type AssistantInput, type AssistantState, type TurnResult } from './engine';
import { detectSafetyConcern } from './safety';

/**
 * Routes each turn to an engine:
 * 1. Deterministic first — safety concerns and the results/safety control buttons always use
 *    the scripted engine, so they never depend on a model being available or well-behaved.
 * 2. Gemini via Google ADK when GEMINI_API_KEY is set (and ASSISTANT_ENGINE isn't "scripted").
 * 3. Scripted fallback whenever Gemini is unavailable, slow or fails.
 * A request in "private" mode skips step 2 entirely: the turn never leaves this server.
 */
// Fast model first; the larger one if it's unavailable.
const DEFAULT_MODELS = 'gemini-3.5-flash-lite,gemini-3.5-flash';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  /** One config per model, tried in order (GEMINI_MODEL is a comma-separated preference list). */
  private readonly gemini: GeminiConfig[];

  constructor(
    @Inject(ProgramsService) private readonly programs: ProgramsService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    const engine = config.get<string>('ASSISTANT_ENGINE') ?? 'gemini';
    const models = (config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODELS)
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const timeoutMs = Number(config.get<string>('GEMINI_TIMEOUT_MS') ?? 20_000);
    this.gemini = apiKey && engine !== 'scripted' ? models.map((model) => ({ apiKey, model, timeoutMs })) : [];
    this.logger.log(
      this.gemini.length ? `Assistant engine: Gemini via ADK (${models.join(' → ')})` : 'Assistant engine: scripted',
    );
  }

  /** Whether AI-assisted mode can be offered at all (a key is configured and it isn't turned off). */
  get aiAvailable(): boolean {
    return this.gemini.length > 0;
  }

  async turn(request: AssistantTurnRequestDto): Promise<AssistantTurnResponseDto> {
    const programs = await this.programs.published();
    const matchable = programs.map(toMatchable);
    const now = new Date();
    const state = request.state as AssistantState | undefined;
    const input: AssistantInput = { text: request.text, choice: request.choice };

    const scripted = () =>
      runTurn(state, input, {
        match: (profile, filters) => matchPrograms(matchable, profile, filters, now),
        documentsFor: (id) => programs.find((program) => program.id === id)?.requiredDocuments,
      });

    const deterministic =
      input.choice?.slot === 'safety' || input.choice?.slot === 'next' || (input.text !== undefined && detectSafetyConcern(input.text));

    let result: TurnResult;
    let engine: AssistantTurnResponseDto['engine'] = 'scripted';
    let geminiResult: TurnResult | null = null;
    if (!deterministic && request.assistantMode !== 'private') {
      // Each attempt starts from the request's state, so a failed model leaves no half-applied changes.
      for (const config of this.gemini) {
        try {
          geminiResult = await runGeminiTurn(state, input, request.locale ?? 'uz', programs, config);
          break;
        } catch (error) {
          this.logger.warn(`Gemini (${config.model}) failed: ${(error as Error).message}`);
        }
      }
    }
    if (geminiResult) {
      result = geminiResult;
      engine = 'gemini';
    } else {
      result = scripted();
    }

    return {
      state: result.state,
      engine,
      messages: result.messages,
      quickReplies: result.quickReplies,
      results: result.outcomes ? decorate(result.outcomes, programs) : undefined,
    };
  }
}
