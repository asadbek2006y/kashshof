import type { ConfigService } from '@nestjs/config';
import type { ProgramsService } from '../programs/programs.service';
import { runGeminiTurn } from './agent/gemini-assistant';
import { AssistantService } from './assistant.service';

// @nestjs/* v12 ships ESM only, which Jest's CommonJS runtime can't load. The routing under test
// doesn't need Nest, so its decorators are stubbed out.
jest.mock('@nestjs/common', () => ({
  Inject: () => () => undefined,
  Injectable: () => (target: unknown) => target,
  Logger: class {
    log() {}
    warn() {}
  },
}));
jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('../programs/programs.service', () => ({ ProgramsService: class {} }));
jest.mock('./agent/gemini-assistant', () => ({ runGeminiTurn: jest.fn() }));

const gemini = runGeminiTurn as jest.MockedFunction<typeof runGeminiTurn>;
const programs = { published: async () => [] } as unknown as ProgramsService;

function service(env: Record<string, string | undefined>) {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return new AssistantService(programs, config);
}

describe('AssistantService engine routing', () => {
  beforeEach(() => {
    gemini.mockResolvedValue({
      state: {
        profile: { needs: [], circumstances: [], notCircumstances: [] },
        mode: 'chat',
        asked: [],
        retried: [],
        filters: {},
        lastResultIds: [],
        turn: 1,
      },
      messages: [{ key: 'llm', text: 'Hello from the model' }],
    });
  });

  it('reports AI availability from configuration', () => {
    expect(service({ GEMINI_API_KEY: 'key' }).aiAvailable).toBe(true);
    expect(service({}).aiAvailable).toBe(false);
    expect(service({ GEMINI_API_KEY: 'key', ASSISTANT_ENGINE: 'scripted' }).aiAvailable).toBe(false);
  });

  it('uses Gemini in AI mode when it is configured', async () => {
    const result = await service({ GEMINI_API_KEY: 'key' }).turn({ text: 'I need food', locale: 'en' });
    expect(result.engine).toBe('gemini');
    expect(gemini).toHaveBeenCalled();
  });

  it('never sends a private-mode turn to Gemini', async () => {
    const result = await service({ GEMINI_API_KEY: 'key' }).turn({
      text: 'I need food',
      locale: 'en',
      assistantMode: 'private',
    });
    expect(result.engine).toBe('scripted');
    expect(gemini).not.toHaveBeenCalled();
  });

  it('keeps safety concerns deterministic even in AI mode', async () => {
    const result = await service({ GEMINI_API_KEY: 'key' }).turn({
      text: 'My husband is threatening me',
      locale: 'en',
      assistantMode: 'ai',
    });
    expect(result.engine).toBe('scripted');
    expect(result.state.mode).toBe('safety');
    expect(gemini).not.toHaveBeenCalled();
  });

  it('falls back to the scripted engine when Gemini fails', async () => {
    gemini.mockRejectedValue(new Error('unavailable'));
    const result = await service({ GEMINI_API_KEY: 'key' }).turn({ text: 'I need food', locale: 'en' });
    expect(result.engine).toBe('scripted');
  });
});
