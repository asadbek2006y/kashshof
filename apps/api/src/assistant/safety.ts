import { matchesAny, normalize } from './text';

/**
 * Recognizes messages that are not a normal support search — threats, violence, feeling unsafe
 * at home. The assistant stops asking intake questions and offers safety options first.
 *
 * Deliberately errs towards triggering: showing safety options to someone who didn't need them
 * costs one tap; missing someone who did is not acceptable.
 */
const SAFETY_KEYWORDS = [
  // English
  'threat', 'abuse', 'abusive', 'violen', 'beats me', 'beat me', 'hits me', 'hit me', 'hurts me', 'hurt me',
  'somewhere safe', 'safe place', 'not safe', "i'm scared", 'i am scared', 'afraid of my', 'scared of my',
  'kill me', 'rape', 'assault', 'locked me',
  // Uzbek
  "zo'ravon", 'kaltak', 'tahdid', 'uradi', 'urib', 'urdi', "o'ldiraman", "o'ldirmoqchi", 'xavfsiz joy',
  "qo'rqaman", 'qo\'rqitadi', 'zo\'rla',
  // Russian
  'бьет', 'избив', 'насил', 'угрож', 'безопасное место', 'боюсь мужа', 'боюсь его', 'убьет', 'изнасил',
];

export function detectSafetyConcern(raw: string): boolean {
  return matchesAny(normalize(raw), SAFETY_KEYWORDS);
}
