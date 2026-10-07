import { parseRefinement } from './refine';
import { detectSafetyConcern } from './safety';

describe('detectSafetyConcern', () => {
  it.each([
    'My husband is threatening me and I need somewhere safe.',
    'Erim meni uradi, qo‘rqaman',
    'Муж меня бьёт, мне нужно безопасное место',
  ])('recognizes "%s"', (text) => {
    expect(detectSafetyConcern(text)).toBe(true);
  });

  it('does not trigger on ordinary requests', () => {
    expect(detectSafetyConcern('I need help paying for university')).toBe(false);
    expect(detectSafetyConcern('Bolam kasal, davolash kerak')).toBe(false);
  });
});

describe('parseRefinement', () => {
  it('reads narrowing requests in three languages', () => {
    expect(parseRefinement('Only ones for women')).toEqual({ type: 'womenOnly' });
    expect(parseRefinement('faqat ochiq dasturlar')).toEqual({ type: 'onlyOpen' });
    expect(parseRefinement('Только те, что принимают заявки')).toEqual({ type: 'onlyOpen' });
  });

  it('resolves "the first one" / "the second one"', () => {
    expect(parseRefinement('What documents does the first one require?')).toEqual({ type: 'documents', index: 0 });
    expect(parseRefinement('ikkinchisi uchun qanday hujjatlar kerak?')).toEqual({ type: 'documents', index: 1 });
    expect(parseRefinement('какие документы нужны для третьей')).toEqual({ type: 'documents', index: 2 });
  });

  it('returns null for new information', () => {
    expect(parseRefinement('I also need food')).toBeNull();
  });
});
