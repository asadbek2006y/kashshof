import { z } from 'zod';

/**
 * Structure of the statement-helper form. Zod checks input shape only (lengths); it never decides
 * eligibility — that stays in matching.ts. Messages are i18n keys under `apply.errors`.
 */
export const LIMITS = { name: 80, answer: 600, statement: 4000 } as const;

export const statementSchema = z.object({
  name: z.string().trim().max(LIMITS.name, 'nameTooLong'),
  reason: z.string().trim().min(1, 'reasonRequired').max(LIMITS.answer, 'answerTooLong'),
  family: z.string().trim().max(LIMITS.answer, 'answerTooLong'),
  background: z.string().trim().max(LIMITS.answer, 'answerTooLong'),
});

export type StatementInput = z.infer<typeof statementSchema>;
