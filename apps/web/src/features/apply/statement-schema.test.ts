import { describe, expect, it } from 'vitest';
import { LIMITS, statementSchema } from './statement-schema';

describe('statementSchema', () => {
  it('requires a reason and accepts optional details', () => {
    expect(statementSchema.safeParse({ name: '', reason: 'Tuition', family: '', background: '' }).success).toBe(true);
    const missing = statementSchema.safeParse({ name: '', reason: '   ', family: '', background: '' });
    expect(missing.success).toBe(false);
    expect(missing.error?.issues[0]?.message).toBe('reasonRequired');
  });

  it('limits length', () => {
    const long = statementSchema.safeParse({ name: '', reason: 'x'.repeat(LIMITS.answer + 1), family: '', background: '' });
    expect(long.error?.issues[0]?.message).toBe('answerTooLong');
  });
});
