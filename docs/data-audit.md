# Organization data audit — 19 October 2026

This audit covers the 52 organizations the directory showed before the review. It checks where
each record's information comes from, whether a source supports it, and what people now see.
The data lives in `apps/api/prisma/research/organizations.json`; the seed turns it into database
rows (`pnpm db:seed`).

## Method

1. **Source check.** We looked for each organization on its own website, on government portals
   (gov.uz, lex.uz, president.uz, cbu.uz), on UN pages and in reputable news (Gazeta.uz, Kun.uz,
   Yuz.uz, Anhor.uz). Only facts stated on a fetched page were recorded, each with its URL and a
   short quote (`evidenceQuote`, for reviewers). Search snippets that weren't opened were not
   used as facts.
2. **Contact check.** Every phone, email and address that the site turns into a link was
   re-checked against the official page on 19 Oct 2026 (Vaqf, rcsad.uz, Erasmus+, IOM, ICRC,
   Baraka). Contacts found only in directories (for example the British Council's) were left out.
3. **Link check.** All 51 website, source and program URLs already in the data returned HTTP 200.
   A response only shows the page is up, not that its content is unchanged.
4. **Status rule** (`apps/api/src/domain/verification.ts`):
   - **Tasdiqlangan / Verified** needs a source page plus a person's dated review note.
   - **Ma'lumot tekshirilmoqda / Information being checked** means there is a source, and it
     is waiting for review.
   - **Tasdiqlanmagan / Unverified** means there is no source yet.

   The seed refuses a review that is missing any part.
5. **Hiding rule.** A record is hidden only when there is positive evidence: the organization
   was dissolved, its work in Uzbekistan ended, or its own country list leaves Uzbekistan out.
   "Not found online" isn't proof that an organization doesn't exist. Those records stay
   visible as *Tasdiqlanmagan*, with a reviewer note.

## Result

| Outcome | Organizations |
| --- | --- |
| Tasdiqlangan (verified by a person) | 0 |
| Ma'lumot tekshirilmoqda (source collected, awaiting review) | 31 |
| Tasdiqlanmagan (no source yet) | 14 |
| Hidden (dissolved, closed or no presence in Uzbekistan) | 7 |
| **Total audited** | **52** |

Before the review, all 52 were "Hali tasdiqlanmagan", and only 15 had a source. Now 31 have a
source and 7 are hidden with the reason recorded, leaving 45 visible. **No record is marked
verified.** Nobody has yet confirmed any record with the organization itself, and the status
rule makes it impossible to claim that without evidence.

Duplicates: none were confirmed. "Bolalar Mahallasi" jamg‘armasi and "Bolalar va oilalarni
qo‘llab-quvvatlash assotsiatsiyasi" may both be the SOS Children's Villages association
(`sos-ozbekiston-bolalar-mahallalari`). They are kept separate and flagged until someone checks.

## All 52 organizations

| # | Organization | Kind | Outcome | Source | Website | Phone | Programs | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Ayollar tadbirkorligini qo‘llab-quvvatlash fondi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 2 | Bolalar va oilalarni qo‘llab-quvvatlash assotsiatsiyasi | Ngo | Tasdiqlanmagan | — | — | — | 0 | Not found; possibly SOS Children’s Villages (snippet only). |
| 3 | Inklyuziv jamiyat fondi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 4 | Islamic Relief | International | Tasdiqlanmagan | — | — | — | 0 | Not on its own country list, but that list says it is incomplete, so not hidden. |
| 5 | Mirabror Usmonov xalqaro xayriya jamoat fondi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 6 | O‘zbekiston Nogironlar aravachasi assotsiatsiyasi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 7 | Qatar Charity dasturlari | International | Tasdiqlanmagan | — | — | — | 0 | Only a one-off 2020 COVID-19 donation found; no office or channel for people. |
| 8 | Save the Children | International | Tasdiqlanmagan | — | — | — | 0 | Official sites blocked or not resolving; only Tajikistan/Kyrgyzstan work found. |
| 9 | UNHCR Markaziy Osiyo | International | Tasdiqlanmagan | — | — | — | 0 | Only a Termez warehouse confirmed; reportedly covered from Almaty (unconfirmed). |
| 10 | “Bolalar Mahallasi” jamg‘armasi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No fund by this name; may duplicate SOS Bolalar Mahallalari (not confirmed). |
| 11 | “Mehrli Qo‘llar” markazi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 12 | “Muruvvat” jamg‘armasi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 13 | “Nana’Said” jamoat fondi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 14 | “Salomatlik” jamg‘armasi | Ngo | Tasdiqlanmagan | — | — | — | 0 | No source found yet (name only). |
| 15 | Bolalarni ijtimoiy moslashtirish Respublika markazi | Government | Ma’lumot tekshirilmoqda | rcsad.uz | ✓ | ✓ | 0 |  |
| 16 | Bolalarni qo‘llab-quvvatlash jamoat fondi | Ngo | Ma’lumot tekshirilmoqda | yuz.uz | — | — | 0 | Created by 2021 decree; no 2024–26 activity found. |
| 17 | British Council O‘zbekiston | International | Ma’lumot tekshirilmoqda | kun.uz | — | — | 0 | Official site didn’t load during research; contacts not confirmed on an official page. |
| 18 | Erasmus+ O‘zbekiston | International | Ma’lumot tekshirilmoqda | erasmus.uz | ✓ | ✓ | 0 | Higher-education programme, not social support — check it fits the audience. |
| 19 | IOM O‘zbekiston | International | Ma’lumot tekshirilmoqda | uzbekistan.iom.int | ✓ | ✓ | 0 | Second phone on its contact page has a mistyped country code (+988); left out. |
| 20 | Ijtimoiy himoya milliy agentligi | Government | Ma’lumot tekshirilmoqda | gov.uz | ✓ | ✓ | 4 |  |
| 21 | Istiqbolli Avlod | Ngo | Ma’lumot tekshirilmoqda | istiqbolliavlod.uz | ✓ | ✓ | 2 |  |
| 22 | ONA Fondi | Ngo | Ma’lumot tekshirilmoqda | gazeta.uz | ✓ | ✓ | 1 | Official site has placeholder (“Lorem ipsum”) programme text. |
| 23 | O‘zbekiston Karlar jamiyati | Ngo | Ma’lumot tekshirilmoqda | president.uz | — | — | 0 | Real, but newest fetched source is from 2018. |
| 24 | O‘zbekiston Ko‘zi ojizlar jamiyati | Ngo | Ma’lumot tekshirilmoqda | yuz.uz | — | — | 0 |  |
| 25 | O‘zbekiston Maxsus Olimpiadasi | Ngo | Ma’lumot tekshirilmoqda | specialolympics.org | — | — | 0 | National site specialolympics.uz no longer resolves; old contacts left out. |
| 26 | O‘zbekiston Volontyorlar assotsiatsiyasi | Ngo | Ma’lumot tekshirilmoqda | gov.uz | — | — | 0 |  |
| 27 | O‘zbekiston musulmonlari idorasi | Ngo | Ma’lumot tekshirilmoqda | muslim.uz | ✓ | — | 0 | Site describes no direct help for individuals; zakat help is via the Vaqf fund. |
| 28 | Red Crescent Society of Uzbekistan | Ngo | Ma’lumot tekshirilmoqda | redcrescent.uz | ✓ | ✓ | 2 |  |
| 29 | SHAROIT PLUS | Ngo | Ma’lumot tekshirilmoqda | anhor.uz | — | — | 0 |  |
| 30 | SOS O‘zbekiston Bolalar Mahallalari | International | Ma’lumot tekshirilmoqda | sos-kd.uz | ✓ | ✓ | 2 |  |
| 31 | Society of Persons with Disabilities of Uzbekistan | Ngo | Ma’lumot tekshirilmoqda | uznj.uz | ✓ | ✓ | 1 | Official site says it is “in test mode”. |
| 32 | Sog‘lom avlod uchun | Ngo | Ma’lumot tekshirilmoqda | sau.uz | ✓ | ✓ | 2 |  |
| 33 | Tadbirkor Ayol | Ngo | Ma’lumot tekshirilmoqda | assembly.uz | — | — | 0 |  |
| 34 | Turkiya Diyanet jamg‘armasi dasturlari | International | Ma’lumot tekshirilmoqda | tdv.org | ✓ | — | 0 | Seasonal aid only, distributed through the Vaqf fund; no office. |
| 35 | UN Women Uzbekistan | International | Ma’lumot tekshirilmoqda | uzbekistan.un.org | ✓ | — | 0 | Website is the regional Europe & Central Asia site. |
| 36 | UNICEF Uzbekistan | International | Ma’lumot tekshirilmoqda | unicef.org | ✓ | ✓ | 1 |  |
| 37 | Xalqaro Qizil Xoch Qo‘mitasi | International | Ma’lumot tekshirilmoqda | icrc.org | ✓ | ✓ | 0 | Works with governments and the Red Crescent; no direct services for individuals stated. |
| 38 | Zamin Foundation | Ngo | Ma’lumot tekshirilmoqda | zaminfoundation.ngo | ✓ | — | 0 | Project pages couldn’t be read; no current programme for individuals confirmed. |
| 39 | “Baraka” ijtimoiy xizmatlar platformasi | Government | Ma’lumot tekshirilmoqda | baraka.gov.uz | ✓ | ✓ | 0 | State social-card platform (re-classed from NGO to government). |
| 40 | “El-yurt umidi” jamg‘armasi | Government | Ma’lumot tekshirilmoqda | spot.uz | ✓ | — | 1 |  |
| 41 | “Ezgu Amal” jamg‘armasi | Ngo | Ma’lumot tekshirilmoqda | ezgu-amal.uz | ✓ | ✓ | 2 | Governance dispute reported in Dec 2024. |
| 42 | “Mahalla” xayriya jamoat fondi | Ngo | Ma’lumot tekshirilmoqda | yuz.uz | — | — | 0 | Source from 2021; no 2024–26 activity found. |
| 43 | “Saxovat va ko‘mak” jamg‘armasi | Ngo | Ma’lumot tekshirilmoqda | lex.uz | — | — | 5 | COVID-era fund (2020) under the Mahalla fund; source is lex.uz. |
| 44 | “Sen yolg‘iz emassan” jamg‘armasi | Ngo | Ma’lumot tekshirilmoqda | oz.sputniknews.uz | — | — | 0 | Newest sources are 2016–2017; current status uncertain. |
| 45 | “Vaqf” xayriya jamoat fondi | Ngo | Ma’lumot tekshirilmoqda | vaqf.uz | ✓ | ✓ | 0 |  |
| 46 | Action Against Hunger | International | Hidden | actionagainsthunger.org | — | — | 0 | Not on the organization’s own list of Asian countries. |
| 47 | CARE International | International | Hidden | care-international.org | — | — | 0 | Not among the 106 countries on its own “Where we work” page. |
| 48 | Human Appeal | International | Hidden | humanappeal.org.uk | — | — | 0 | Not on its own “our work by country” page. |
| 49 | Jahon oziq-ovqat dasturi | International | Hidden | wfp.org | — | — | 0 | Only a logistics hub in Termez serving Afghanistan; not on WFP’s country list. |
| 50 | Mercy Corps dasturlari | International | Hidden | europe.prosperglobal.org | — | — | 0 | Uzbekistan operations (2020–2025) closed; page now Prosper Global. |
| 51 | O‘zbekiston Yoshlar ittifoqi | Government | Hidden | cbu.uz | — | — | 0 | Dissolved; the Youth Affairs Agency was created on its base (cbu.uz). Consider listing the successor (gov.uz/oz/yoshlar). |
| 52 | “Chegarasiz shifokorlar” | International | Hidden | msf.org | — | — | 0 | MSF: both Uzbekistan projects concluded in 2025 (msf.org). |

## Blockers and next steps

- **Verification needs a person.**
  1. Open the `sourceUrl`.
  2. Confirm the details with the organization, ideally by calling the listed number.
  3. Add a `review` block to the organization in `organizations.json`:
     `{ "reviewedAt": "2026-11-01", "note": "Phone and services confirmed by phone with the office" }`.
  4. Re-run the seed.

  Start with the organizations that have programs and phone numbers: IHMA, Saxovat va ko‘mak,
  Red Crescent, SOS, Ezgu Amal and Istiqbolli Avlod.
- **14 organizations have no source.** They are listed above as *Tasdiqlanmagan*. They need
  someone who knows the sector, or the team member who supplied the list, to say which body was
  meant.
- **Stale sources:** the Society of the Deaf (2018), Bolalarni qo‘llab-quvvatlash jamoat fondi
  and the "Mahalla" fund (2021), and "Sen yolg‘iz emassan" (2016–17). Ask the organizations
  whether they still operate.
- **Audience fit:** someone should decide whether these belong in a directory for women and
  families: ICRC, Erasmus+, the British Council, the Muslim Board, the Volunteers Association and
  Türkiye Diyanet. Each source describes no direct help for individuals, or it is education
  rather than support.
- **Successors to consider adding:** the Youth Affairs Agency (successor to the Youth Union).
- **Reports.** Reports from the "Xatolik haqida xabar berish" form are stored in `InfoReport`
  with status `NEW`. Review them through `GET /api/v1/reports` and
  `PATCH /api/v1/reports/:id` (header `x-review-token: $REPORTS_REVIEW_TOKEN`). Accepting a report
  doesn't change any data: a person edits the research file.
