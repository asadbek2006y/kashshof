# Hamroh — clickable prototype

An AI-guided support finder for women and families in Uzbekistan. A person describes her
situation in plain language (Uzbek, Russian or English), answers a few tappable questions, and
gets programs that may fit, each with the reasons why, what still needs checking, the
documents needed, and what to do next.

> **Data status.** All 23 programs now come from public sources: official websites, gov.uz,
> my.gov.uz, lex.uz and UN pages. Each has a source link, stored in
> `apps/api/prisma/research/organizations.json`. None of them has been reviewed by a person yet,
> so every organization is still "Not yet verified", and pages say "Collected from public
> sources — not yet reviewed by a person". The invented sample programs from the first prototype
> (`prisma/seed-data.ts`) are no longer seeded for any organization that has research.

## Architecture

```
apps/web   Next.js 16 (App Router) · React 19 · Tailwind v4 · next-intl (uz default, ru, en)
apps/api   NestJS 12 · Prisma 7 (PostgreSQL) · Swagger → OpenAPI → typed web client
```

These principles come from the product brief:

- **The database decides what exists.** Programs are structured records (support types, age
  range, regions, required and target circumstances, documents, status, deadline).
- **Matching rules decide potential eligibility.** `apps/api/src/matching/matching.ts` is a pure
  function. It returns *Strong potential match / Possible match / More information needed*, never
  a percentage. Every label comes with ✓ (fits), ? (needs checking) and ! (might not qualify)
  reasons.
- **The assistant only handles language.** `apps/api/src/assistant/` routes each turn to an engine:
  1. **Fixed code first.** Safety concerns and the results/safety buttons always use the scripted
     engine, so they never depend on a model.
  2. **Gemini through Google ADK** (`assistant/agent/`) when `GEMINI_API_KEY` is set. An ADK
     `LlmAgent` works only through tools over the same matching engine and data:
     - `update_profile` records facts into the structured profile
     - `search_programs` runs `matching.ts`
     - `get_program_details` answers questions about documents and eligibility
     - `offer_choices` shows tappable answers

     It can't invent programs; the result cards always come from the matcher. The ADK session lasts
     only for one request, and earlier turns travel with the browser-held state. `GEMINI_MODEL` is an
     ordered list; each model is tried in turn.
  3. **The scripted engine** as a fallback when there's no key, or the model is slow or failing. It
     uses rule-based uz/ru/en extraction and a slot-filling state machine. The response's `engine`
     field says which one answered.
- **The person chooses how the assistant listens.** Before the first message, `/ask` offers
  *Private guided* (the default: the request carries `assistantMode: "private"` and never reaches a
  model) or *AI-assisted* (Gemini). `GET /api/v1/assistant/info` tells the UI whether AI is available.
  If Gemini fails mid-conversation, the UI says it is continuing with guided questions.
- **Private by design.** The conversation lives in application memory only
  (`apps/web/src/features/chat/conversation-store.tsx`, mounted above the locale layout): not in
  localStorage, sessionStorage, URLs or analytics. Refreshing or closing the tab clears it. The API
  stores nothing about the person. **Quick exit** (header button, or Esc twice) wipes that memory and
  any `hamroh.*` session storage, hides the page and *replaces* the history entry; it can't erase
  earlier browser history, and the Safety page says so. Saved programs (public program data only)
  stay in `localStorage` and can be cleared from `/saved`.
- **Safety overrides everything.** Once the deterministic rules fire, a safety panel with urgent
  numbers stays above the conversation and results for the rest of the session, progress and the
  "What I understood" summary are hidden, and nothing animates.

## Design system

Tokens live in `apps/web/src/app/globals.css`. The design rationale and audit are in `docs/redesign.md`.
- Inter only (Latin and Cyrillic). A warm neutral background, white surfaces, deep teal for action,
  amber only for attention, and red reserved for danger and safety. Every text/background pair meets
  WCAG 2.2 AA.
- Status is never colour alone: fit labels, application status and data status each pair an icon
  with words.
- Generic primitives live in `components/ui`, product components (`MatchCard`, `MatchBadge`,
  `MatchReasonList`, `ProgramSource`, `VerificationStatus`, …) in `components/hamroh`, and flows in
  `features/{chat,matching,programs,apply,safety,home}`.
- Motion (`motion/react`, variants in `lib/motion.ts`) only marks state changes and lasts 150–300ms.
  It respects `prefers-reduced-motion`.
- On phones there's a five-item bottom bar. Automated tests check for horizontal overflow at 320,
  360 and 390px in all three languages.

## Organization directory

`apps/api/prisma/directory-data.ts` holds the team's list of 100 organization names (10 sections;
69 unique once repeats are merged). It gives names only, so nothing else was added: all are
"Not yet verified", with no descriptions, contacts or programs.

Each entry has a `kind`. `PARTNER` (funders, development banks, umbrella bodies) and `GROUPING`
(generic entries like "Zakot jamg‘armalari") are kept for reference but never shown to people.
The 10 organizations that already have sample programs are merged by slug. Only organizations
with programs can come up in matching and the assistant; the rest appear only in the directory
until their programs are added.

## Researched data

The file `apps/api/prisma/research/organizations.json` covers 18 organizations and was collected
on 23 Sep 2026. For each organization it records:
- sourced contacts
- a description in uz/ru/en
- programs, each with a `sourceUrl` and a supporting quote (`evidenceQuote`, for reviewers only)
- notes on what couldn't be confirmed

Three organizations from the list couldn't be confirmed to exist or operate: Mehr Nuri,
"Mehribonlik" jamg‘armasi and Gender tengligi markazi. They're flagged `hidden` and never shown
to people. `src/programs/research-data.spec.ts` checks that every program has a source link, uses
known vocabulary and has text in all three languages.

To mark something verified, a person should open its `sourceUrl`, confirm the details with the
organization, and then set `verification: VERIFIED` and `lastVerifiedAt`.

## Run it

Requires Node 24, pnpm 12 and Docker. Ports: web **3100**, API **4100**, Postgres **5433**.

```sh
pnpm install
cp apps/api/.env.example apps/api/.env   # add GEMINI_API_KEY to use Gemini; leave it empty for the scripted engine
cp apps/web/.env.example apps/web/.env.local
pnpm db:up          # Postgres in Docker
pnpm db:setup       # migrations + seed (10 organizations, 20 sample programs)
pnpm dev            # API on :4100, web on :3100 → http://localhost:3100
```

## Checks

```sh
pnpm typecheck && pnpm lint
pnpm test                                    # API unit tests (matching, intent, safety, engine routing) + web unit tests (Vitest)
pnpm --filter hamroh-web test:e2e            # Playwright flows + axe accessibility checks (conversations use private guided mode)
E2E_GEMINI=1 pnpm --filter hamroh-web exec playwright test gemini   # live Gemini flow (normal API)
pnpm contract                                # regenerate OpenAPI + web client after API changes
```

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Landing page: a calm hero video/still of a Navruz gathering (desktop only, plays once, pausable), Find support / Browse programs, trust points, how it works and fictional demo situations (each with a photo), what Kashshof can't decide, urgent help |
| `/credits` | Photo and video credits (Creative Commons attribution) |
| `/ask` | Privacy notice and mode choice (Private guided / AI-assisted), then the guided conversation with progress, tappable answers and inline explained results |
| `/results` | All matches as Match cards (fit label, ✓ ? ! reasons, what to do next, official source), with filters and honest empty and error states |
| `/explore` | Browse every program without the assistant: search, plus category, region, provider, target-group, open-only and data-status filters |
| `/organizations` | Organization directory: search and filter by the source list's 10 sections |
| `/programs/:id`, `/organizations/:slug` | Structured program and organization pages, each with a "Why/Who can apply" section, documents, contact details and a trust block |
| `/saved` | Saved programs (this device only) |
| `/dashboard`, `/applications`, `/profile` | Signed-in screens, shown with the fixed demo persona "Malika" and clearly labelled |
| `/apply/:programId` | Prepare application in four steps: requirements, document checklist, an editable statement draft, then the official place to apply. It ends with "Nothing has been submitted." |
| `/how-it-works` | System diagram (story → assistant → facts → deterministic rules → database → explanation) and what Kashshof can't do |
| `/sign-in` | Says plainly that accounts aren't in the prototype; links to the demo account |
| `/safety` | Urgent numbers (112, 102, 103, 101, confirmed against Gazeta.uz, March 2025) and confidential services |
| `/org`, `/org/new` | Organization dashboard. The new-program form saves a draft; drafts are never shown or matched |

## Deviations from the plan

- The planned separate `ProgramSubmission` model was replaced by `Program.isDraft`. Drafts are
  excluded from every public query and from matching.
- `pnpm dev` for the API runs through the SWC require hook, not `tsx`. esbuild doesn't emit decorator
  metadata, so Nest's global `ValidationPipe` would silently skip DTO validation.
- There's no dedicated women's-support hotline number on `/safety` yet. None could be confirmed
  from a reliable source, so the page says so instead of guessing.
