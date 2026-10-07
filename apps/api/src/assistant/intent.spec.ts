import { emptyProfile } from '../domain/profile';
import { extractFacts, mergeFacts } from './intent';

describe('extractFacts', () => {
  it('understands the brief’s English example', () => {
    const facts = extractFacts(
      'I am a single mother in Tashkent. I have two children and recently lost my job. I need temporary financial and food assistance.',
    );
    expect(facts.needs).toEqual(expect.arrayContaining(['financial', 'food']));
    expect(facts.needs).not.toContain('employment');
    expect(facts.region).toBe('tashkent_city');
    expect(facts.gender).toBe('female');
    expect(facts.childrenCount).toBe(2);
    expect(facts.circumstances).toEqual(expect.arrayContaining(['single_parent', 'unemployed', 'has_children']));
  });

  it('understands Uzbek, including apostrophe variants', () => {
    const facts = extractFacts('Men Samarqandda yashayman, 22 yoshdaman, talabaman. Universitet kontraktini to‘lashga pulim yetmayapti.');
    expect(facts.needs).toEqual(expect.arrayContaining(['education', 'financial']));
    expect(facts.region).toBe('samarkand');
    expect(facts.ageMin).toBe(22);
    expect(facts.circumstances).toContain('student');
  });

  it('understands Russian', () => {
    const facts = extractFacts('Я мать-одиночка из Ферганы, двое детей, не работаю. Нужны продукты.');
    expect(facts.needs).toContain('food');
    expect(facts.region).toBe('fergana');
    expect(facts.childrenCount).toBe(2);
    expect(facts.circumstances).toEqual(expect.arrayContaining(['single_parent', 'unemployed']));
    expect(facts.circumstances).not.toContain('employed');
    expect(facts.needs).not.toContain('mental_wellbeing');
  });

  it('prefers the region phrase over the city name', () => {
    expect(extractFacts('Toshkent viloyatida yashayman').region).toBe('tashkent_region');
  });

  it('does not misread look-alike words', () => {
    const facts = extractFacts('I got fired last month and need a shelter for a moment');
    expect(facts.needs).not.toContain('emergency');
    expect(facts.gender).toBeUndefined();
  });

  it('reads "mother of two" and exact ages', () => {
    const facts = extractFacts("I'm 34, a mother of two, and I want to start a small business");
    expect(facts.ageMin).toBe(34);
    expect(facts.childrenCount).toBe(2);
    expect(facts.needs).toContain('business');
  });
});

describe('mergeFacts', () => {
  it('keeps employed and unemployed mutually exclusive', () => {
    const employed = mergeFacts(emptyProfile(), { circumstances: ['employed'] });
    const now = mergeFacts(employed, { circumstances: ['unemployed'] });
    expect(now.circumstances).toEqual(['unemployed']);
    expect(now.notCircumstances).toEqual(['employed']);
  });
});
