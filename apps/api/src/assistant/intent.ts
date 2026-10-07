import type { SupportProfile } from '../domain/profile';
import type { Circumstance, Gender, Region, SupportType } from '../domain/vocabulary';
import { matchesAny, normalize, type NormalizedText } from './text';

/**
 * Rule-based understanding of what the person wrote. This is the prototype's stand-in for an
 * LLM: it only ever extracts facts into the structured profile, and the matching engine — not
 * this file — decides what fits.
 */

const NEED_KEYWORDS: Record<SupportType, string[]> = {
  financial: [
    'money', 'financ', 'pay', 'debt', 'loan', 'afford', 'benefit', 'cash', 'not enough money',
    'pul', 'moliya', "to'la", "to'lov", 'qarz', 'nafaqa', 'kredit', 'pulim yetmay', "pulim yo'q",
    'деньг', 'денег', 'финанс', 'оплат', 'долг', 'кредит', 'пособ', 'выплат', 'материальн',
  ],
  education: [
    'universit', 'tuition', 'college', 'school', 'education', 'study', 'studies', 'scholarship', 'course',
    "o'qish", "o'qishim", 'universitet', 'institut', 'kontrakt', "ta'lim", 'maktab', 'stipendiya', 'kurs',
    'учеб', 'универ', 'институт', 'образован', 'контракт', 'стипенд', 'обучен', 'школ', 'курс',
  ],
  food: [
    'food', 'grocer', 'hungry', 'meal', 'eat',
    'oziq', 'ovqat', 'mahsulot', 'ochlik',
    'еда', 'еды', 'продукт', 'питан', 'голод',
  ],
  health: [
    'medical', 'treatment', 'hospital', 'surgery', 'doctor', 'medicine', 'sick', 'illness', 'health', 'clinic',
    'davol', 'kasal', 'shifokor', 'dori', 'operatsiya', 'shifoxona', "sog'liq",
    'лечен', 'больн', 'врач', 'лекарств', 'операц', 'здоров', 'медицин',
  ],
  maternity: [
    'pregnan', 'maternity', 'newborn', 'baby', 'expecting a baby',
    'homilador', "tug'ruq", 'chaqaloq',
    'беремен', 'роды', 'родов', 'младен', 'новорожд', 'декрет',
  ],
  children_family: [
    'child', 'kid', 'family', 'son', 'daughter',
    'bola', 'farzand', 'oila', "o'g'il",
    'ребен', 'дет', 'сын', 'доч', 'семь',
  ],
  employment: [
    // Wanting work — not describing job loss ("lost my job" is a circumstance, see below).
    'employment', 'career', 'vacanc', 'find work', 'looking for work', 'need work', 'find a job', 'need a job',
    'looking for a job', 'get a job', 'new job', 'job search',
    'ish top', 'ish qidir', 'ish kerak', 'ishga joy', 'ishga kir',
    'трудоустр', 'ваканс', 'найти работу', 'ищу работу', 'нужна работа',
  ],
  business: [
    'business', 'entrepreneur', 'startup', 'start a shop',
    'biznes', 'tadbirkor', "o'z ishim",
    'бизнес', 'предприним', 'свое дело',
  ],
  housing: [
    'housing', 'apartment', 'homeless', 'rent', 'shelter', 'evict', 'place to live', 'somewhere to live',
    'uy joy', 'ijara', 'boshpana', 'yashash joy', 'yashashga joy',
    'жиль', 'квартир', 'аренд', 'приют', 'негде жить',
  ],
  legal: [
    'legal', 'lawyer', 'divorce', 'alimony', 'court', 'rights',
    'yurist', 'huquq', 'ajrim', 'ajrash', 'aliment', 'sud', 'advokat',
    'юрист', 'развод', 'алимент', 'суд', 'адвокат', 'юридич', 'права', 'правов',
  ],
  safety: ['safety', 'unsafe', 'xavfsiz', 'безопасн'],
  disability: ['disab', 'wheelchair', 'nogiron', 'инвалид', 'ограниченн'],
  mental_wellbeing: [
    'stress', 'anxiety', 'anxious', 'depress', 'psycholog', 'lonely', 'mental',
    'ruhiy', 'psixolog', 'tushkun', 'xavotir',
    'стресс', 'тревог', 'депресс', 'психолог', 'одиночеств',
  ],
  emergency: [
    'emergency', 'urgent', '=fire', 'flood', 'disaster', 'earthquake',
    'favqulodda', 'shoshilinch', "yong'in", 'toshqin', 'zilzila',
    'срочн', 'чрезвычайн', 'пожар', 'наводнен', 'землетрясен',
  ],
};

// Checked in order: region phrases before bare city names, so "Toshkent viloyati" wins over "Toshkent".
const REGION_KEYWORDS: [Region, string[]][] = [
  ['tashkent_region', ['tashkent region', 'toshkent viloyat', 'ташкентская область', 'ташкентской области']],
  ['tashkent_city', ['tashkent', 'toshkent', 'ташкент']],
  ['samarkand', ['samarkand', 'samarqand', 'самарканд']],
  ['bukhara', ['bukhara', 'buxoro', 'бухар']],
  ['fergana', ['fergana', "farg'ona", 'fargona', 'ферган']],
  ['andijan', ['andijan', 'andijon', 'андижан']],
  ['namangan', ['namangan', 'наманган']],
  ['khorezm', ['khorezm', 'xorazm', 'хорезм', 'urgench', 'urganch', 'ургенч']],
  ['karakalpakstan', ['karakalpak', "qoraqalpog", 'каракалп', 'nukus', 'нукус']],
  ['kashkadarya', ['kashkadar', 'qashqadaryo', 'кашкадар', 'karshi', 'qarshi', 'карши']],
  ['surkhandarya', ['surkhandar', 'surxondaryo', 'сурхандар', 'termez', 'termiz', 'термез']],
  ['jizzakh', ['jizzakh', 'jizzax', 'джизак']],
  ['navoi', ['navoi', 'navoiy', 'навои']],
  ['syrdarya', ['syrdar', 'sirdaryo', 'сырдар', 'gulistan', 'guliston', 'гулистан']],
];

const CIRCUMSTANCE_KEYWORDS: Partial<Record<Circumstance, string[]>> = {
  student: ['student', 'studying', 'i study', 'talaba', "o'qiyman", 'студент', 'учусь'],
  single_parent: [
    'single mother', 'single mom', 'single mum', 'single parent', 'raising my child alone', 'raising them alone',
    "yolg'iz ona", 'yakka ona', "yolg'iz o'zim tarbiyal", "bolalarimni yolg'iz",
    'одинокая мать', 'мать одиночка', 'мама одиночка', 'одна воспитываю',
  ],
  unemployed: [
    'unemploy', 'lost my job', 'no job', "don't have a job", 'do not have a job', 'not working', 'jobless',
    'ishsiz', 'ishdan ayril', "ishim yo'q", 'ishlamayman',
    'безработ', 'потеряла работу', 'потерял работу', 'нет работы', 'не работаю',
  ],
  employed: ['i work as', "i'm working", 'i am working', 'employed', 'ishlayman', 'работаю'],
  pregnant: ['pregnan', 'expecting a baby', 'homilador', 'беремен'],
  disability: ['disab', 'wheelchair', 'nogiron', 'инвалид'],
  low_income: [
    'low income', 'no money', "can't afford", 'cannot afford', 'not enough money',
    "pulim yo'q", 'pul yetmay', "kam ta'minlangan",
    'малоимущ', 'не хватает денег', 'нет денег',
  ],
  entrepreneur: ['my business', 'own business', 'tadbirkorman', 'предпринимател'],
};

const CHILD_KEYWORDS = [
  'child', 'kid', 'son', 'daughter', 'bola', 'farzand', "o'g'lim", 'qizim', 'ребен', 'дети', 'детей', 'сын', 'доч',
];

const FEMALE_KEYWORDS = [
  'woman', 'women', 'mother', '=mom', '=mum', 'wife', 'girl', '=she',
  'ayol', '=ona', 'onaman', 'qizman', 'xotin', 'kelin',
  'женщин', '=мать', '=мама', '=жена', 'девушк',
];
const MALE_KEYWORDS = ["i'm a man", 'i am a man', 'erkakman', 'я мужчина'];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  bir: 1, bitta: 1, ikki: 2, ikkita: 2, uch: 3, uchta: 3, "to'rt": 4, "to'rtta": 4, besh: 5, beshta: 5,
  один: 1, одна: 1, одного: 1, два: 2, двое: 2, двух: 2, три: 3, трое: 3, трех: 3, четыре: 4, четверо: 4,
};

export interface ExtractedFacts {
  needs: SupportType[];
  region?: Region;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  childrenCount?: number;
  circumstances: Circumstance[];
}

function extractAge(input: NormalizedText): number | undefined {
  const patterns = [
    /\s(\d{1,2})\s?(?:years?|yrs?|yo|yosh|yoshda|yoshdaman|лет|год)/u,
    /\s(?:i'm|im|i am|aged?|мне)\s(\d{1,2})\s/u,
    /\s(\d{1,2})\s?(?:years?\s)?old\s/u,
  ];
  for (const pattern of patterns) {
    const match = input.text.match(pattern);
    const age = match ? Number(match[1]) : NaN;
    if (age >= 14 && age <= 99) return age;
  }
  return undefined;
}

function extractChildrenCount(input: NormalizedText): number | undefined {
  const match =
    input.text.match(/\s(\d{1,2}|[\p{L}']+)\s(?:ta\s)?(?:children|kids|child|bola|farzand|дет|ребен)/u) ??
    input.text.match(/\s(?:mother|mom|mum|father|parent) of (\d{1,2}|[\p{L}']+)\s/u);
  if (!match) return undefined;
  const raw = match[1];
  const count = /^\d+$/.test(raw) ? Number(raw) : NUMBER_WORDS[raw];
  return count && count > 0 && count < 20 ? count : undefined;
}

export function extractFacts(raw: string): ExtractedFacts {
  const input = normalize(raw);
  const facts: ExtractedFacts = { needs: [], circumstances: [] };

  for (const [need, keywords] of Object.entries(NEED_KEYWORDS) as [SupportType, string[]][]) {
    if (matchesAny(input, keywords)) facts.needs.push(need);
  }

  facts.region = REGION_KEYWORDS.find(([, keywords]) => matchesAny(input, keywords))?.[0];

  const age = extractAge(input);
  if (age !== undefined) {
    facts.ageMin = age;
    facts.ageMax = age;
  }

  for (const [circumstance, keywords] of Object.entries(CIRCUMSTANCE_KEYWORDS) as [Circumstance, string[]][]) {
    if (matchesAny(input, keywords)) facts.circumstances.push(circumstance);
  }
  // "не работаю" / "not working" contain the employed stems; unemployed wins.
  if (facts.circumstances.includes('unemployed')) {
    facts.circumstances = facts.circumstances.filter((c) => c !== 'employed');
  }

  const childrenCount = extractChildrenCount(input);
  if (childrenCount !== undefined) facts.childrenCount = childrenCount;
  if (
    childrenCount !== undefined ||
    facts.circumstances.includes('single_parent') ||
    matchesAny(input, CHILD_KEYWORDS)
  ) {
    facts.circumstances.push('has_children');
  }

  if (matchesAny(input, MALE_KEYWORDS)) facts.gender = 'male';
  else if (matchesAny(input, FEMALE_KEYWORDS) || facts.circumstances.includes('pregnant')) facts.gender = 'female';

  // A mention of children describes the family, not necessarily a need for child-specific
  // support — keep children_family only when nothing more specific was asked for.
  if (facts.needs.includes('children_family') && facts.needs.length > 1) {
    facts.needs = facts.needs.filter((n) => n !== 'children_family');
  }
  return facts;
}

const EXCLUSIVE: [Circumstance, Circumstance][] = [['employed', 'unemployed']];

/** Merge new facts into the profile. Newer statements override older ones. */
export function mergeFacts(profile: SupportProfile, facts: Partial<ExtractedFacts>): SupportProfile {
  const next: SupportProfile = {
    ...profile,
    needs: [...new Set([...profile.needs, ...(facts.needs ?? [])])],
    circumstances: [...profile.circumstances],
    notCircumstances: [...profile.notCircumstances],
  };
  if (facts.region) next.region = facts.region;
  if (facts.ageMin !== undefined && facts.ageMax !== undefined) {
    next.ageMin = facts.ageMin;
    next.ageMax = facts.ageMax;
  }
  if (facts.gender) next.gender = facts.gender;
  if (facts.childrenCount !== undefined) next.childrenCount = facts.childrenCount;

  for (const circumstance of facts.circumstances ?? []) {
    confirm(next, circumstance);
  }
  return next;
}

export function confirm(profile: SupportProfile, circumstance: Circumstance): void {
  if (!profile.circumstances.includes(circumstance)) profile.circumstances.push(circumstance);
  profile.notCircumstances = profile.notCircumstances.filter((c) => c !== circumstance);
  for (const [a, b] of EXCLUSIVE) {
    const other = circumstance === a ? b : circumstance === b ? a : null;
    if (other) {
      profile.circumstances = profile.circumstances.filter((c) => c !== other);
      if (!profile.notCircumstances.includes(other)) profile.notCircumstances.push(other);
    }
  }
}

export function deny(profile: SupportProfile, circumstance: Circumstance): void {
  profile.circumstances = profile.circumstances.filter((c) => c !== circumstance);
  if (!profile.notCircumstances.includes(circumstance)) profile.notCircumstances.push(circumstance);
}

/** True when the text carried anything the profile can use. */
export function hasFacts(facts: ExtractedFacts): boolean {
  return (
    facts.needs.length > 0 ||
    facts.region !== undefined ||
    facts.ageMin !== undefined ||
    facts.circumstances.length > 0 ||
    facts.childrenCount !== undefined
  );
}
