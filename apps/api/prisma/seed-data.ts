/**
 * Prototype sample data.
 *
 * Organization names are real Uzbekistan organizations named in the product brief, used so the
 * prototype reads realistically. Everything else — the programs, eligibility rules, deadlines,
 * statuses and descriptions — is ILLUSTRATIVE and has not been checked against any official
 * source. That is why every organization is UNVERIFIED and no contact detail is filled in; the
 * web app shows a prototype-data notice on every program page.
 *
 * Dates are relative to the day the seed runs so the demo always shows a realistic mix of
 * fresh, stale, soon-closing and closed programs.
 */

type L = { uz: string; ru: string; en: string };

export interface SeedOrganization {
  slug: string;
  name: string;
  description: L;
  categories: string[];
}

export interface SeedProgram {
  id: string;
  orgSlug: string;
  title: L;
  summary: L;
  howToApply: L;
  supportTypes: string[];
  genders?: string[];
  ageMin?: number;
  ageMax?: number;
  regions?: string[];
  targetCircumstances?: string[];
  requiredCircumstances?: string[];
  incomeTested?: boolean;
  requiredDocuments: string[];
  applicationStatus: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  /** Days from seed time; negative = already passed. */
  deadlineInDays?: number;
  /** Days before seed time the status was last checked; omitted = never. */
  statusCheckedDaysAgo?: number;
}

export const SEED_SOURCE = 'Prototype sample data — not yet checked against official sources';

export const organizations: SeedOrganization[] = [
  {
    slug: 'ona-fondi',
    name: 'ONA Fondi',
    categories: ['maternity', 'children_family', 'financial'],
    description: {
      en: 'A foundation focused on mothers: support around pregnancy, new babies and families raising children on one income.',
      uz: 'Onalarga yo‘naltirilgan jamg‘arma: homiladorlik, chaqaloq parvarishi va farzandlarini yolg‘iz tarbiyalayotgan oilalarga yordam.',
      ru: 'Фонд, ориентированный на матерей: поддержка во время беременности, после рождения ребёнка и семьям с одним доходом.',
    },
  },
  {
    slug: 'soglom-avlod',
    name: 'Sog‘lom avlod uchun',
    categories: ['health', 'children_family', 'maternity'],
    description: {
      en: 'An international charitable fund working on the health of mothers and children.',
      uz: 'Ona va bola salomatligi yo‘nalishida faoliyat yurituvchi xalqaro xayriya jamg‘armasi.',
      ru: 'Международный благотворительный фонд, работающий в сфере здоровья матери и ребёнка.',
    },
  },
  {
    slug: 'un-women-uz',
    name: 'UN Women Uzbekistan',
    categories: ['employment', 'business', 'safety', 'legal'],
    description: {
      en: 'The United Nations entity for gender equality, working with partners on women’s economic opportunities and safety.',
      uz: 'Gender tengligi bo‘yicha BMT tuzilmasi — hamkorlar bilan ayollarning iqtisodiy imkoniyatlari va xavfsizligi ustida ishlaydi.',
      ru: 'Структура ООН по вопросам гендерного равенства; вместе с партнёрами работает над экономическими возможностями и безопасностью женщин.',
    },
  },
  {
    slug: 'zamin',
    name: 'Zamin Foundation',
    categories: ['education', 'health', 'disability', 'children_family'],
    description: {
      en: 'A foundation supporting education, health and inclusion for children and young people.',
      uz: 'Bolalar va yoshlarning ta’limi, salomatligi va inklyuziyasini qo‘llab-quvvatlovchi jamg‘arma.',
      ru: 'Фонд, поддерживающий образование, здоровье и инклюзию детей и молодёжи.',
    },
  },
  {
    slug: 'mehr-nuri',
    name: 'Mehr Nuri',
    categories: ['food', 'financial', 'emergency'],
    description: {
      en: 'A charitable foundation providing everyday help to families going through a difficult period.',
      uz: 'Og‘ir davrni boshdan kechirayotgan oilalarga kundalik yordam ko‘rsatuvchi xayriya jamg‘armasi.',
      ru: 'Благотворительный фонд, оказывающий повседневную помощь семьям в трудный период.',
    },
  },
  {
    slug: 'istiqbolli-avlod',
    name: 'Istiqbolli Avlod',
    categories: ['safety', 'legal', 'housing'],
    description: {
      en: 'A non-governmental organization offering confidential help, legal advice and referrals for people in unsafe situations.',
      uz: 'Xavfli vaziyatga tushib qolgan insonlarga maxfiy yordam, huquqiy maslahat va yo‘naltirish beruvchi nodavlat tashkilot.',
      ru: 'Негосударственная организация: конфиденциальная помощь, юридические консультации и направление к специалистам для людей в опасной ситуации.',
    },
  },
  {
    slug: 'tadbirkor-ayol',
    name: 'Tadbirkor Ayol',
    categories: ['business', 'employment'],
    description: {
      en: 'An association of business women supporting women who start and grow small businesses.',
      uz: 'Kichik biznes boshlayotgan va rivojlantirayotgan ayollarni qo‘llab-quvvatlovchi ishbilarmon ayollar uyushmasi.',
      ru: 'Ассоциация деловых женщин, поддерживающая женщин, которые открывают и развивают малый бизнес.',
    },
  },
  {
    slug: 'red-crescent-uz',
    name: 'Red Crescent Society of Uzbekistan',
    categories: ['emergency', 'food', 'health'],
    description: {
      en: 'A humanitarian society providing emergency relief and community health support.',
      uz: 'Favqulodda yordam va jamoat salomatligi bo‘yicha ko‘mak beruvchi insonparvarlik jamiyati.',
      ru: 'Гуманитарное общество, оказывающее экстренную помощь и поддержку здоровья населения.',
    },
  },
  {
    slug: 'unicef-uz',
    name: 'UNICEF Uzbekistan',
    categories: ['children_family', 'education', 'health'],
    description: {
      en: 'The UN children’s agency, working with partners on early childhood, health and education.',
      uz: 'BMTning bolalar jamg‘armasi — erta yoshdagi rivojlanish, salomatlik va ta’lim bo‘yicha hamkorlar bilan ishlaydi.',
      ru: 'Детский фонд ООН; вместе с партнёрами работает над развитием в раннем детстве, здоровьем и образованием.',
    },
  },
  {
    slug: 'disability-society-uz',
    name: 'Society of Persons with Disabilities of Uzbekistan',
    categories: ['disability', 'employment', 'health'],
    description: {
      en: 'A public association representing and supporting people with disabilities.',
      uz: 'Nogironligi bo‘lgan shaxslar manfaatlarini ifodalovchi va qo‘llab-quvvatlovchi jamoat birlashmasi.',
      ru: 'Общественное объединение, представляющее и поддерживающее людей с инвалидностью.',
    },
  },
];

const APPLY_CONTACT: L = {
  en: 'Contact the organization directly and mention this program. Bring the documents listed on this page.',
  uz: 'Tashkilotga to‘g‘ridan-to‘g‘ri murojaat qiling va ushbu dasturni ayting. Ushbu sahifada ko‘rsatilgan hujjatlarni olib boring.',
  ru: 'Обратитесь в организацию напрямую и назовите эту программу. Возьмите с собой документы, указанные на этой странице.',
};

export const programs: SeedProgram[] = [
  {
    id: 'ona-new-mothers',
    orgSlug: 'ona-fondi',
    title: { en: 'Support for new mothers', uz: 'Yosh onalar uchun yordam', ru: 'Поддержка молодых мам' },
    summary: {
      en: 'Baby essentials and a one-time payment for mothers in the first months after birth, or late in pregnancy.',
      uz: 'Tug‘ruqdan keyingi dastlabki oylarda yoki homiladorlikning so‘nggi oylarida onalarga chaqaloq uchun zarur buyumlar va bir martalik to‘lov.',
      ru: 'Детские принадлежности и единовременная выплата мамам в первые месяцы после родов или на позднем сроке беременности.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['maternity', 'children_family', 'financial'],
    genders: ['female'],
    targetCircumstances: ['pregnant', 'single_parent', 'has_children'],
    requiredDocuments: ['id_document', 'birth_certificate', 'family_composition'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 3,
  },
  {
    id: 'ona-single-mothers',
    orgSlug: 'ona-fondi',
    title: {
      en: 'Monthly family support for single mothers',
      uz: 'Yolg‘iz onalar uchun oylik oilaviy yordam',
      ru: 'Ежемесячная помощь одиноким матерям',
    },
    summary: {
      en: 'A monthly payment and a food package for mothers raising children alone, for up to six months.',
      uz: 'Farzandlarini yolg‘iz tarbiyalayotgan onalarga olti oygacha oylik to‘lov va oziq-ovqat to‘plami.',
      ru: 'Ежемесячная выплата и продуктовый набор для мам, воспитывающих детей в одиночку, на срок до шести месяцев.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['financial', 'food', 'children_family'],
    genders: ['female'],
    regions: ['tashkent_city', 'tashkent_region', 'samarkand'],
    requiredCircumstances: ['single_parent'],
    targetCircumstances: ['unemployed', 'low_income'],
    incomeTested: true,
    requiredDocuments: ['id_document', 'birth_certificate', 'income_certificate', 'family_composition'],
    applicationStatus: 'OPEN',
    deadlineInDays: 40,
    statusCheckedDaysAgo: 2,
  },
  {
    id: 'soglom-avlod-child-treatment',
    orgSlug: 'soglom-avlod',
    title: {
      en: 'Help with a child’s medical treatment',
      uz: 'Bolani davolashda yordam',
      ru: 'Помощь в лечении ребёнка',
    },
    summary: {
      en: 'Partial or full coverage of treatment, surgery or medicines for children under 18.',
      uz: '18 yoshgacha bo‘lgan bolalarni davolash, operatsiya yoki dori-darmon xarajatlarini qisman yoki to‘liq qoplash.',
      ru: 'Частичная или полная оплата лечения, операций или лекарств для детей до 18 лет.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['health', 'children_family'],
    targetCircumstances: ['has_children'],
    requiredDocuments: ['id_document', 'birth_certificate', 'medical_report'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 6,
  },
  {
    id: 'soglom-avlod-maternal-health',
    orgSlug: 'soglom-avlod',
    title: {
      en: 'Free check-ups during pregnancy',
      uz: 'Homiladorlik davrida bepul tibbiy ko‘rik',
      ru: 'Бесплатные обследования во время беременности',
    },
    summary: {
      en: 'Scheduled check-ups and ultrasound at partner clinics for pregnant women.',
      uz: 'Homilador ayollar uchun hamkor klinikalarda rejali ko‘riklar va UTT.',
      ru: 'Плановые осмотры и УЗИ в клиниках-партнёрах для беременных женщин.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['health', 'maternity'],
    genders: ['female'],
    regions: ['tashkent_city', 'samarkand', 'bukhara', 'fergana', 'khorezm', 'karakalpakstan'],
    requiredCircumstances: ['pregnant'],
    requiredDocuments: ['id_document', 'medical_report'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 12,
  },
  {
    id: 'unwomen-skills-jobs',
    orgSlug: 'un-women-uz',
    title: {
      en: 'Skills and jobs for women',
      uz: 'Ayollar uchun kasb va ish',
      ru: 'Навыки и работа для женщин',
    },
    summary: {
      en: 'Free short courses (digital skills, sewing, accounting) followed by help finding a job.',
      uz: 'Bepul qisqa kurslar (raqamli ko‘nikmalar, tikuvchilik, buxgalteriya) va keyin ish topishda yordam.',
      ru: 'Бесплатные короткие курсы (цифровые навыки, шитьё, бухгалтерия) и затем помощь в трудоустройстве.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['employment', 'education'],
    genders: ['female'],
    ageMin: 18,
    ageMax: 45,
    targetCircumstances: ['unemployed', 'single_parent'],
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
    deadlineInDays: 25,
    statusCheckedDaysAgo: 4,
  },
  {
    id: 'unwomen-survivor-support',
    orgSlug: 'un-women-uz',
    title: {
      en: 'Confidential support for women experiencing violence',
      uz: 'Zo‘ravonlikka duch kelgan ayollar uchun maxfiy yordam',
      ru: 'Конфиденциальная помощь женщинам, пострадавшим от насилия',
    },
    summary: {
      en: 'Referral to a partner crisis centre for psychological support, legal advice and, if needed, a safe place to stay.',
      uz: 'Hamkor inqiroz markaziga yo‘naltirish: psixologik yordam, huquqiy maslahat va zarur bo‘lsa xavfsiz boshpana.',
      ru: 'Направление в партнёрский кризисный центр: психологическая помощь, юридическая консультация и при необходимости безопасное жильё.',
    },
    howToApply: {
      en: 'You do not need any documents to ask for help. Contact the crisis centre privately; you can stay anonymous.',
      uz: 'Yordam so‘rash uchun hujjat shart emas. Inqiroz markaziga maxfiy murojaat qiling; ismingizni aytmasangiz ham bo‘ladi.',
      ru: 'Для обращения документы не нужны. Свяжитесь с кризисным центром конфиденциально — можно анонимно.',
    },
    supportTypes: ['safety', 'legal', 'mental_wellbeing', 'housing'],
    genders: ['female'],
    targetCircumstances: ['survivor'],
    requiredDocuments: [],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 1,
  },
  {
    id: 'zamin-education-grant',
    orgSlug: 'zamin',
    title: {
      en: 'Education grant for young women',
      uz: 'Yosh qizlar uchun ta’lim granti',
      ru: 'Образовательный грант для девушек',
    },
    summary: {
      en: 'Covers part of university tuition (kontrakt) for female students from families with limited income.',
      uz: 'Daromadi cheklangan oilalardan bo‘lgan talaba qizlarning universitet kontraktining bir qismini qoplaydi.',
      ru: 'Покрывает часть оплаты за обучение (контракт) студенток из семей с ограниченным доходом.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['education', 'financial'],
    genders: ['female'],
    ageMin: 17,
    ageMax: 25,
    requiredCircumstances: ['student'],
    targetCircumstances: ['low_income', 'single_parent'],
    incomeTested: true,
    requiredDocuments: ['id_document', 'enrollment_certificate', 'income_certificate'],
    applicationStatus: 'OPEN',
    deadlineInDays: 37,
    statusCheckedDaysAgo: 5,
  },
  {
    id: 'zamin-inclusive-education',
    orgSlug: 'zamin',
    title: {
      en: 'Inclusive education for children with disabilities',
      uz: 'Nogironligi bo‘lgan bolalar uchun inklyuziv ta’lim',
      ru: 'Инклюзивное образование для детей с инвалидностью',
    },
    summary: {
      en: 'Learning materials, tutor support and help enrolling children with disabilities in school.',
      uz: 'O‘quv materiallari, repetitor yordami va nogironligi bo‘lgan bolalarni maktabga joylashtirishda ko‘mak.',
      ru: 'Учебные материалы, помощь репетитора и содействие в зачислении в школу детей с инвалидностью.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['education', 'disability', 'children_family'],
    targetCircumstances: ['has_children', 'disability'],
    requiredDocuments: ['id_document', 'birth_certificate', 'disability_certificate'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 20,
  },
  {
    id: 'zamin-rehabilitation',
    orgSlug: 'zamin',
    title: {
      en: 'Rehabilitation and assistive care',
      uz: 'Reabilitatsiya va yordamchi parvarish',
      ru: 'Реабилитация и вспомогательный уход',
    },
    summary: {
      en: 'Rehabilitation sessions at partner centres for children and young people with disabilities.',
      uz: 'Nogironligi bo‘lgan bolalar va yoshlar uchun hamkor markazlarda reabilitatsiya mashg‘ulotlari.',
      ru: 'Реабилитационные занятия в партнёрских центрах для детей и молодёжи с инвалидностью.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['health', 'disability'],
    ageMax: 30,
    targetCircumstances: ['disability'],
    requiredDocuments: ['id_document', 'disability_certificate', 'medical_report'],
    applicationStatus: 'UNKNOWN',
  },
  {
    id: 'mehr-nuri-food-packages',
    orgSlug: 'mehr-nuri',
    title: {
      en: 'Monthly food packages for families',
      uz: 'Oilalar uchun oylik oziq-ovqat to‘plamlari',
      ru: 'Ежемесячные продуктовые наборы для семей',
    },
    summary: {
      en: 'A basic food package each month for families going through job loss, illness or other hardship.',
      uz: 'Ishdan ayrilish, kasallik yoki boshqa qiyinchilikni boshdan kechirayotgan oilalarga har oy asosiy oziq-ovqat to‘plami.',
      ru: 'Ежемесячный базовый продуктовый набор для семей, переживающих потерю работы, болезнь или другие трудности.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['food', 'financial'],
    regions: ['tashkent_city', 'tashkent_region', 'fergana', 'andijan', 'namangan'],
    targetCircumstances: ['low_income', 'single_parent', 'unemployed', 'has_children'],
    incomeTested: true,
    requiredDocuments: ['id_document', 'family_composition'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 2,
  },
  {
    id: 'mehr-nuri-winter-help',
    orgSlug: 'mehr-nuri',
    title: {
      en: 'Winter heating and utilities help',
      uz: 'Qishki isitish va kommunal to‘lovlarga yordam',
      ru: 'Помощь с отоплением и коммунальными платежами зимой',
    },
    summary: {
      en: 'Help paying heating and utility bills for families with children during the winter months.',
      uz: 'Qish oylarida farzandli oilalarga isitish va kommunal to‘lovlarni to‘lashda yordam.',
      ru: 'Помощь семьям с детьми в оплате отопления и коммунальных услуг в зимние месяцы.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['financial', 'housing'],
    targetCircumstances: ['low_income', 'has_children'],
    incomeTested: true,
    requiredDocuments: ['id_document', 'residence_certificate', 'income_certificate'],
    applicationStatus: 'CLOSED',
    statusCheckedDaysAgo: 9,
  },
  {
    id: 'istiqbolli-safe-shelter',
    orgSlug: 'istiqbolli-avlod',
    title: {
      en: 'Safe shelter referral',
      uz: 'Xavfsiz boshpanaga yo‘naltirish',
      ru: 'Направление в безопасное убежище',
    },
    summary: {
      en: 'Confidential help finding a temporary safe place to stay for you and your children.',
      uz: 'Siz va farzandlaringiz uchun vaqtinchalik xavfsiz joy topishda maxfiy yordam.',
      ru: 'Конфиденциальная помощь в поиске временного безопасного жилья для вас и ваших детей.',
    },
    howToApply: {
      en: 'No documents are needed to ask. Reach out privately; if you are in immediate danger, call emergency services first.',
      uz: 'Murojaat uchun hujjat kerak emas. Maxfiy bog‘laning; agar xavf bevosita bo‘lsa, avval favqulodda xizmatlarga qo‘ng‘iroq qiling.',
      ru: 'Для обращения документы не нужны. Свяжитесь конфиденциально; если опасность непосредственная — сначала звоните в экстренные службы.',
    },
    supportTypes: ['safety', 'housing'],
    targetCircumstances: ['survivor', 'has_children'],
    requiredDocuments: [],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 1,
  },
  {
    id: 'istiqbolli-legal-counselling',
    orgSlug: 'istiqbolli-avlod',
    title: {
      en: 'Free legal counselling',
      uz: 'Bepul huquqiy maslahat',
      ru: 'Бесплатная юридическая консультация',
    },
    summary: {
      en: 'Advice on divorce, alimony, property and documents, with a lawyer or trained counsellor.',
      uz: 'Ajrim, aliment, mulk va hujjatlar bo‘yicha yurist yoki maslahatchi bilan suhbat.',
      ru: 'Консультации юриста или консультанта по разводу, алиментам, имуществу и документам.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['legal', 'mental_wellbeing'],
    targetCircumstances: ['survivor', 'single_parent'],
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 8,
  },
  {
    id: 'tadbirkor-startup-grants',
    orgSlug: 'tadbirkor-ayol',
    title: {
      en: 'Women’s entrepreneurship program',
      uz: 'Ayollar tadbirkorligi dasturi',
      ru: 'Программа женского предпринимательства',
    },
    summary: {
      en: 'Small start-up grants, business training and a mentor for women opening or growing a small business.',
      uz: 'Kichik biznes ochayotgan yoki kengaytirayotgan ayollarga kichik grantlar, biznes o‘qitish va murabbiy.',
      ru: 'Небольшие стартовые гранты, бизнес-обучение и наставник для женщин, открывающих или развивающих малый бизнес.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['business', 'financial', 'employment'],
    genders: ['female'],
    ageMin: 18,
    ageMax: 55,
    targetCircumstances: ['entrepreneur', 'unemployed', 'single_parent'],
    requiredDocuments: ['id_document', 'business_plan'],
    applicationStatus: 'OPEN',
    deadlineInDays: 10,
    statusCheckedDaysAgo: 2,
  },
  {
    id: 'tadbirkor-mentoring',
    orgSlug: 'tadbirkor-ayol',
    title: {
      en: 'Business mentoring circle',
      uz: 'Biznes murabbiylik to‘garagi',
      ru: 'Кружок бизнес-наставничества',
    },
    summary: {
      en: 'Monthly meetings with experienced business women to plan, price and sell.',
      uz: 'Tajribali ishbilarmon ayollar bilan har oylik uchrashuvlar: rejalashtirish, narx belgilash, sotish.',
      ru: 'Ежемесячные встречи с опытными предпринимательницами: планирование, ценообразование, продажи.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['business', 'employment'],
    genders: ['female'],
    targetCircumstances: ['entrepreneur'],
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 15,
  },
  {
    id: 'red-crescent-emergency-relief',
    orgSlug: 'red-crescent-uz',
    title: {
      en: 'Emergency relief',
      uz: 'Favqulodda yordam',
      ru: 'Экстренная помощь',
    },
    summary: {
      en: 'Food, hygiene kits and temporary help for households affected by fire, flood or other emergencies.',
      uz: 'Yong‘in, suv toshqini yoki boshqa favqulodda holatdan zarar ko‘rgan xonadonlarga oziq-ovqat, gigiyena to‘plamlari va vaqtinchalik yordam.',
      ru: 'Продукты, гигиенические наборы и временная помощь семьям, пострадавшим от пожара, наводнения или других ЧС.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['emergency', 'food', 'housing'],
    requiredDocuments: ['id_document'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 3,
  },
  {
    id: 'red-crescent-home-care',
    orgSlug: 'red-crescent-uz',
    title: {
      en: 'Home care visits for older people',
      uz: 'Keksalar uchun uyda parvarish',
      ru: 'Уход на дому для пожилых людей',
    },
    summary: {
      en: 'Volunteer and nurse visits for older people living alone or with a disability.',
      uz: 'Yolg‘iz yashovchi yoki nogironligi bo‘lgan keksalarga ko‘ngillilar va hamshiralar tashrifi.',
      ru: 'Визиты волонтёров и медсестёр к пожилым людям, живущим одиноко или с инвалидностью.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['health', 'disability'],
    ageMin: 60,
    targetCircumstances: ['disability'],
    requiredDocuments: ['id_document', 'medical_report'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 30,
  },
  {
    id: 'unicef-early-childhood',
    orgSlug: 'unicef-uz',
    title: {
      en: 'Early childhood and parenting support',
      uz: 'Erta yoshdagi bolalar va ota-onalarga ko‘mak',
      ru: 'Поддержка раннего развития и родителей',
    },
    summary: {
      en: 'Home visits and parenting sessions on child health, nutrition and early learning for families with children under 3.',
      uz: '3 yoshgacha bolasi bor oilalarga bola salomatligi, ovqatlanishi va erta rivojlanishi bo‘yicha uyga tashriflar va mashg‘ulotlar.',
      ru: 'Визиты на дом и занятия для родителей детей до 3 лет: здоровье, питание и раннее развитие.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['children_family', 'health', 'education', 'maternity'],
    targetCircumstances: ['has_children', 'pregnant'],
    requiredDocuments: ['id_document', 'birth_certificate'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 95,
  },
  {
    id: 'disability-society-employment',
    orgSlug: 'disability-society-uz',
    title: {
      en: 'Employment support for people with disabilities',
      uz: 'Nogironligi bo‘lgan shaxslarni ishga joylashtirish',
      ru: 'Трудоустройство людей с инвалидностью',
    },
    summary: {
      en: 'Job matching with inclusive employers and help adapting the workplace.',
      uz: 'Inklyuziv ish beruvchilar bilan bog‘lash va ish joyini moslashtirishda yordam.',
      ru: 'Подбор работы у инклюзивных работодателей и помощь в адаптации рабочего места.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['employment', 'disability'],
    ageMin: 18,
    requiredCircumstances: ['disability'],
    requiredDocuments: ['id_document', 'disability_certificate'],
    applicationStatus: 'OPEN',
    statusCheckedDaysAgo: 10,
  },
  {
    id: 'disability-society-assistive-devices',
    orgSlug: 'disability-society-uz',
    title: {
      en: 'Assistive devices',
      uz: 'Yordamchi vositalar',
      ru: 'Вспомогательные средства',
    },
    summary: {
      en: 'Wheelchairs, hearing aids and other assistive devices, fully or partly covered.',
      uz: 'Nogironlik aravachalari, eshitish apparatlari va boshqa yordamchi vositalar — to‘liq yoki qisman qoplanadi.',
      ru: 'Инвалидные коляски, слуховые аппараты и другие вспомогательные средства — полная или частичная оплата.',
    },
    howToApply: APPLY_CONTACT,
    supportTypes: ['disability', 'health', 'financial'],
    requiredCircumstances: ['disability'],
    incomeTested: true,
    requiredDocuments: ['id_document', 'disability_certificate', 'medical_report', 'income_certificate'],
    applicationStatus: 'UNKNOWN',
  },
];
