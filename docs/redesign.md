# UI/UX redesign — audit and plan

Working notes for the redesign described in `gooal.md`. The product contract doesn't change:
**the assistant handles language; deterministic code decides programs, matching and safety.**

## Current architecture (before the redesign)

| Concern | Where | Notes |
| --- | --- | --- |
| Matching | `apps/api/src/matching/matching.ts` | Pure function → `strong` / `possible` / `needs_info` + ✓ ? ! reasons (i18n keys). Untouched. |
| Safety detection | `apps/api/src/assistant/safety.ts` | Keyword rules in uz/ru/en. `AssistantService` routes safety turns to the scripted engine before any model is called. Untouched. |
| Engine routing | `apps/api/src/assistant/assistant.service.ts` | Deterministic first → Gemini (ADK, tools over the matcher) → scripted fallback. |
| Scripted engine | `apps/api/src/assistant/engine.ts`, `intent.ts`, `refine.ts` | Slot-filling state machine. Untouched. |
| Gemini | `apps/api/src/assistant/agent/` | Can only call tools; result cards always come from the matcher. Untouched. |
| Program data | `apps/api/prisma/research/organizations.json` | 23 sourced programs, none reviewed by a person. |
| Web shell | `apps/web/src/components/shell/` | Header, bottom nav, language switcher, Quick exit. |
| Conversation | `apps/web/src/components/ask/chat.tsx` | 375 lines; transcript **and typed text** persisted to `sessionStorage`. |

## Audit findings

**Privacy**
- The full transcript (including the person's own words) was written to `sessionStorage` on every turn.
- The home page handed the typed story to `/ask` through `sessionStorage` (`hamroh.pending`).
- Nothing told the person *before* they typed whether Gemini would see their words; the AI notice appeared only under the chat input after the first reply.
- There was no way to choose a no-AI mode.

**Safety**
- A safety turn rendered as a normal assistant message with a coloured rule. Urgent numbers were one tap away, not on screen.
- Quick exit cleared `sessionStorage` but not in-memory state (moot, since it navigates away), and was only tested by clicking — not Esc twice.

**Results / matching UX**
- Match rows had no "what to do next" and no link to the official source; the source was only on the program page's sidebar.
- The three fit labels were never explained.
- No-match copy ("No programs match all of these filters") read as "no help exists".
- Errors had no retry.

**Program page**
- Sections: Who can apply, Documents, How to apply. Missing: why it matched *you*, what to confirm, what could rule you out, data status as a first-class section.
- "Verified organization" and "Not yet verified" were the only states; source collected vs manually reviewed vs officially confirmed weren't distinguished.

**Apply flow**
- "Upload" and "Submit application" buttons looked real. The "nothing was sent" notice appeared only after pressing Submit.
- Depended on the demo persona ("Malika") for name and documents.

**Browse**
- `/explore` filtered by support type only; no search, region, provider or target-group filters (the list DTO had no regions).
- Category list included categories with zero programs.

**Navigation / IA**
- Mobile bottom bar spent two of five slots on demo-only screens (Applications, Profile) and had no route to browsing or urgent help.
- Desktop footer hidden on phones.
- Home page hero was a free-text box — the chatbot was the hero.

**Visual system**
- Two type families (Inter + Source Serif), aubergine/terracotta palette, no surfaces. Fit status shown by a 6px dot + colour.
- Utilities were consistent, but match/program rows were duplicated between `match-card`, `program-card`, `saved-view` and the home page.

**Accessibility**
- Fit badge relied on colour + a dot (label present, so not colour-only, but weak).
- Chat transcript was one big `aria-live` region (re-announces history on restore).
- No automated accessibility checks.

**Testing**
- 8 Playwright flows; required the API to be restarted with `ASSISTANT_ENGINE=scripted`. No web unit tests, no axe.

## Plan

1. **API (additive, small):** `assistantMode: 'ai' | 'private'` on the turn request (private never calls Gemini);
   `GET /assistant/info` → `{ aiAvailable }`; `regions` and `targetCircumstances` on the program summary for browse filters.
2. **Foundation:** new tokens (warm neutral, deep teal, amber for attention, red for danger only), Inter only,
   motion variants, `components/ui` primitives, `components/hamroh` product components.
3. **Sensitive state in memory:** a `ConversationProvider` mounted above the locale layout holds the transcript and
   the profile. Nothing the person says touches storage or URLs; refresh starts fresh. Legacy keys are wiped.
4. **Core journey:** home → `/ask` (privacy + mode choice first) → conversation with progress + chips → results with
   Match cards → program page → prepare application.
5. **Safety:** a deterministic safety panel takes over the conversation; Quick exit clears memory and storage.
6. **Secondary:** browse with filters, How it works with the system diagram, demo situations.
7. **QA:** Vitest for pure UI logic, Playwright for the 20 critical flows (run in private mode, so no API restart is
   needed), axe on main pages.

---

# Outcome (2026-10-07)

## 1. Design direction
Calm and plain, not "SaaS": a warm neutral page, white surfaces only for things you act on, deep
teal for action, amber for attention, red only for danger. Inter for everything. Status is always
icon + words + colour. The conversation isn't the hero — the home page leads with "Find support"
and "Browse support programs", and the conversation reads as a guided interview with visible progress.

## 2–3. Main UX changes and pages redesigned
- **Home** — one job: two CTAs, three trust points, real dataset counts and AI status, how it
  works, fictional demo situations, "Kashshof doesn't decide eligibility", urgent help.
- **/ask** — privacy notice and mode choice *before* anything is typed; progress (Your situation →
  A few details → Possible support → Next steps); tappable answers; "What I understood" panel;
  retry on failure; AI-fallback notice; Start over behind a confirm dialog.
- **/results** — Match cards: fit label, a one-line meaning, "Why this appeared" (✓ / ? / !),
  "What to do next" (derived only from matcher reasons), View details, Official source, Save,
  application status, data status. A legend explains the three labels. Includes loading steps,
  an error state with retry, and an empty state that never says "no help exists".
- **/programs/:id** — What it provides · Who it may be for · Why Kashshof matched it (from this
  session's match, in memory) · Things to confirm · What could make you ineligible · Documents
  (checklist) · How to apply (numbered) · Official source · Data status. The source and status sit
  in the first screen too.
- **/apply/:id** — "Prepare application", 4 steps, editable statement (react-hook-form + zod),
  copy/print, and a final "Nothing has been submitted." with the official link.
- **/explore** — search plus category, region, provider, target group, open-only and data-status
  filters, built from the data (no empty categories), in a bottom sheet on phones.
- **/safety**, **/how-it-works** (system diagram), **/saved** (clear-all), shell (header, footer,
  bottom bar, language switch, Quick exit).

## 4. New reusable components
`components/ui`: Button, Dialog/Sheet, ConfirmDialog, Skeleton/CardSkeleton, Notice, EmptyState,
ErrorState, PageHeader/SectionHeading.
`components/hamroh`: MatchCard, MatchBadge, MatchReasonList, NextStepLine, ProgramCard,
ProgramSource, ProgramStatus, VerificationStatus, PrivacyNotice, AIProviderNotice,
DocumentChecklist, ApplicationSteps, SaveButton.
`features/chat`: ConversationProvider, useAssistant, ConversationProgress, ModeChooser,
ConversationMessage, SuggestedAnswerChips, ConversationComposer, SituationSummary, ChatResults.
`features/safety`: SafetyPanel, urgent numbers. `features/matching`: ResultsView, FitLegend,
MatchingProgress. `features/programs`: ProgramBrowser, filterPrograms, MatchEvidence, DataStatus.

## 5. Libraries added
| Library | Why |
| --- | --- |
| `motion` | State-change motion (message entrance, results stagger, disclosure height), with reduced-motion support via `MotionConfig` |
| `@radix-ui/react-dialog` | Accessible dialogs and the mobile filter sheet (focus trap, Esc, focus return). The only Radix primitive needed |
| `react-hook-form`, `zod`, `@hookform/resolvers` | The statement form: one schema for input shape and lengths. Eligibility stays in `matching.ts` |
| `sonner` | Non-critical toasts (saved, copied). Nothing important is toast-only |
| `clsx`, `tailwind-merge` | `cn()` for composing component classes |
| `vitest` (dev) | Unit tests for pure UI logic and message-catalogue checks |
| `@axe-core/playwright` (dev) | Automated WCAG checks inside the e2e suite |

Not added: shadcn CLI (components are hand-written in the same spirit and owned by the app),
TanStack Query (only two client fetches; public program data is server-rendered), any analytics or
session replay.

## 6. Privacy
- The transcript is no longer written to `sessionStorage` (legacy keys are wiped on load and on
  Quick exit). It lives in memory only, so refreshing clears it.
- Nothing typed reaches a URL: hand-offs (demo situations) go through memory, and browse search
  isn't synced to the address bar. A test records every request URL.
- AI is opt-in, and its disclosure is shown before anything is typed. Private guided mode never
  calls a model (enforced server-side, unit-tested).
- Saved programs can be cleared from `/saved`.

## 7. Safety
Detection is unchanged and deterministic (`apps/api/src/assistant/safety.ts`, routed before any
model). Once it fires, the UI shows a SafetyPanel (112 / 1146 / 102, link to /safety) above
everything for the rest of the session. Progress and the personal summary are hidden, there's no
motion, and the summary never shows "survivor"-type facts. Quick exit: Esc twice works anywhere
(capture phase), memory and storage are wiped, and the page is replaced. All of this is e2e-tested.

## 8–9. Accessibility and responsive
Skip link, focusable `main`, visible 3px focus rings, `role="log"` transcript, labelled radio
cards, `aria-expanded` disclosures, focus moved to each new apply-step heading, form errors linked
by `aria-describedby`, 44–48px targets, AA contrast. Phones get a bottom bar, a filter bottom sheet,
a sticky composer above the bar, a compact language select at < 640px, and no overflow at
320/360/390 in uz/ru/en.

## 10. Testing performed
- API: 54 Jest tests (including 5 new routing tests: private mode and safety never call Gemini,
  fallback on failure).
- Web: 22 Vitest tests (next-step derivation, review status, browse filters, statement schema,
  uz/ru catalogue shape and placeholders, no eligibility claims or percentages in copy).
- Playwright: 38 passing (desktop + Pixel 7). They cover all 20 scenarios in the goal, plus demo,
  browse, saved, and axe on 12 pages/states. The live Gemini flow (`E2E_GEMINI=1`) passed.
- Lighthouse (production build, mobile profile): Accessibility 99–100, Best Practices 96,
  Performance 91–94, CLS 0.

## 12. Known limitations
- Switching language mid-conversation keeps the conversation (tested), but a page reload clears it by design;
  Gemini replies already shown stay in the language they were written in.
- Dashboard, profile, applications and the organization dashboard were re-themed through the
  tokens, not restructured.
- The chat shows at most 8 results (engine `MAX_RESULTS`); `/results` shows all.
- No manual screen-reader pass (NVDA/VoiceOver) has been done.

## 13. Needs human verification
- Uzbek and Russian copy was written for this redesign. A native speaker should review it.
- No program has been reviewed against its source by a person (every program says so).
- Urgent numbers are unchanged from the earlier verified list; re-confirm before any public use.
- The product name on screen is "Kashshof" (the codebase and docs say Hamroh).

## 14. Where the critical logic lives
| Concern | File |
| --- | --- |
| Matching (fit + reasons) | `apps/api/src/matching/matching.ts` |
| Safety detection | `apps/api/src/assistant/safety.ts` |
| Engine routing, private mode | `apps/api/src/assistant/assistant.service.ts` |
| Next step from reasons | `apps/web/src/lib/next-step.ts` |
| Data review status | `apps/web/src/lib/review-status.ts` |
| In-memory conversation, wipe, safety flag | `apps/web/src/features/chat/conversation-store.tsx` |
| Quick exit | `apps/web/src/components/shell/quick-exit.tsx` |

---

# Home page imagery (2026-10-08)

Goal: make the opening feel human and reassuring ("real people, help exists, I can start here")
without losing readability, seriousness or speed.

**Media** (all from Wikimedia Commons; attribution on each photo and at `/credits`;
registry in `apps/web/src/features/home/media-credits.ts`):

| Where | What | Author · licence |
| --- | --- | --- |
| Hero (video + still) | A Navruz gathering in Uzbekistan: women and girls in ikat and atlas dresses, families at tables | Lokk1y · CC BY-SA 4.0 |
| Beside "How Kashshof works" | A woman at a doorway holding a dasturkhan (the gift wedding guests bring) | Sinchalak Musulmon · CC BY-SA 4.0 |
| Beside the demo situations | A smiling mother holding her child in Samarkand | Adam Jones · CC BY-SA 2.0 |

Rejected: footage dominated by soft-drink branding, a private prayer scene, a street shot without
people, and any image that frames people as helpless or poor.

**Hero behaviour** (`apps/web/src/features/home/hero-media.tsx`)
- The clip is cropped to the women and families, slowed to 0.6×, muted (no audio track at all),
  1280×900, 1.4 MB WebM / 1.6 MB MP4. It **plays once and rests on its last frame**, which is also
  the poster, so it never loops or jumps.
- Video only at ≥1024px with no `prefers-reduced-motion`, no Save-Data and no 2G/3G. Everyone else
  (and any load error) gets the still poster served as AVIF/WebP. Phones never download the video.
- A visible "Pause background video" button while it moves (WCAG 2.2.2). The video is
  `aria-hidden` and has no controls of its own.
- Readability: on desktop the media fills the right ~60% under a cream wash that stays ≥94% opaque
  wherever text can reach (worst case, ink-2 text over a black pixel still meets 4.5:1). Below
  1024px it's a photo band above the text that fades into the page.
- **Urgent help moved out of the hero** onto the plain page, so nothing animated sits behind
  emergency information. The safety block further down is unchanged and static.

**Photos further down** fade in once (450ms) as they scroll into view, and carry captions and
credits. There are only two, so photos don't take over the page.

**Measured** (production build, Lighthouse): home mobile Performance 93 / LCP 3.2s (94 / 2.7s
before imagery); desktop 99–100 / LCP 0.8–1.0s (the video loads after the LCP paint);
Accessibility 100, Best Practices 100, CLS 0 on both.

**Tests** (`apps/web/e2e/flows.spec.ts`): the video is muted, non-looping and pausable on desktop;
reduced motion and phones request no video at all; a failed load or Save-Data falls back to the
still; urgent help isn't inside the hero; every photo has alt text, a caption and a credit; axe on
`/credits`; no horizontal overflow at 320/360/390px.

**Needs a human:** the people shown are identifiable members of the public photographed at public
events. The licences allow this use, and `/credits` states they aren't Kashshof users. For a public
launch, consider commissioning photography with model releases.
