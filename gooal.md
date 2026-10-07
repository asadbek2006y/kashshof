# HAMROH — PRODUCT UI/UX REDESIGN GOAL

## Mission

Transform the current Hamroh prototype into a polished, trustworthy, accessible, multilingual capstone product that looks and behaves like a real public-support platform for women and families in Uzbekistan.

This is **not only a visual redesign**.

Review and improve the complete user experience:

- information architecture
- navigation
- page hierarchy
- visual design
- component consistency
- conversation UX
- matching-result UX
- program detail pages
- safety behavior
- privacy communication
- multilingual behavior
- responsive behavior
- motion and micro-interactions
- loading/error/empty states
- accessibility
- forms
- source transparency
- demo states
- frontend architecture
- automated tests

Do not rewrite working matching/safety/business logic unnecessarily.

The final system should preserve the existing core product contract:

**AI helps communicate. Deterministic code decides programs and matching.**

---

# 1. PRODUCT EXPERIENCE WE WANT

Hamroh should feel:

**Calm**
Not visually noisy.

**Human**
Use understandable language instead of government terminology.

**Safe**
A person in a stressful situation should never feel trapped in the interface.

**Trustworthy**
Show why a result appeared and where the information came from.

**Private**
Make privacy understandable before the user shares sensitive information.

**Supportive without overpromising**
Never say that a person definitely qualifies unless the underlying official system can establish that.

**Modern**
It should look like a high-quality 2026 product, but not like a generic SaaS dashboard.

Avoid:

- overly corporate dashboard design
- excessive gradients
- glassmorphism everywhere
- AI sparkle icons everywhere
- unnecessary charts
- excessive pink/purple “women-focused” branding
- huge animations
- childish illustrations
- fake testimonials
- fake statistics
- fake “verified” badges
- fake AI confidence percentages

The design should communicate:

> “You can explain what is happening. Hamroh will help you understand where you can start.”

---

# 2. CORE USER JOURNEY

The main experience should be extremely clear:

### Stage 1 — Understand

The user chooses:

- Uzbek
- Russian
- English

Then Hamroh briefly explains:

- what it does
- what it cannot guarantee
- privacy behavior
- whether Gemini is active

Primary CTA:

**Find support**

Secondary CTA:

**Browse programs**

Safety link:

**I need urgent help**

---

### Stage 2 — Tell Hamroh what is happening

The conversation should feel closer to a guided support interview than a generic ChatGPT window.

Do not make the chatbot itself the hero of the product.

The purpose of the conversation is to collect enough structured information for deterministic matching.

Show a small progress model such as:

**Your situation → A few details → Possible support → Next steps**

Do not show fake percentages like:

“75% complete.”

Use conversational progress.

Allow natural-language input.

When appropriate, provide easy answer chips such as:

- Yes
- No
- I'm not sure
- Tashkent
- Another region
- Skip for now

Never force the person to repeatedly type information that could be selected.

---

# 3. GEMINI / PRIVATE GUIDED MODE

If technically feasible with the current architecture, make the privacy distinction much clearer.

Provide two conversational modes:

### AI-assisted mode

Explain clearly:

“Your messages are processed by Google Gemini to help understand your situation. Gemini does not decide which support programs you qualify for.”

### Private guided mode

Use the existing deterministic/scripted fallback.

Explain:

“Your answers stay in this browser session. Hamroh will guide you using predefined questions.”

This would be a very strong capstone feature because it demonstrates privacy-aware AI design.

Do not make Gemini sound required for matching.

---

# 4. RESULTS PAGE — MOST IMPORTANT PAGE

The Results page should receive the most UX attention.

The user should immediately understand:

1. What programs may help?
2. Why did Hamroh show them?
3. What is uncertain?
4. What should I do next?

Never show matching percentages.

Use exactly the product's matching vocabulary:

### Strong potential match

Meaning:
The information currently provided matches the major known conditions.

### Possible match

Meaning:
Some conditions match, but important conditions remain uncertain.

### More information needed

Meaning:
Hamroh cannot meaningfully assess the program without more information.

Create a consistent Match Card component.

Each result card should show:

**Program name**

**Organization / provider**

**Match status**

**Short explanation**

### Why this appeared

✓ What fits

? What needs checking

! What may prevent eligibility

### What to do next

A very concrete action.

Examples:

- Check these documents
- Contact this organization
- Open the official application page
- Confirm your household income
- Confirm whether your district participates

Then:

**View program details**

and

**Official source**

The source should never be hidden at the bottom of a page.

---

# 5. PROGRAM DETAIL PAGE

Every program should have a consistent information architecture.

Show:

## What this program provides

Human-readable summary.

## Who it may be for

Plain-language eligibility conditions.

## Why Hamroh matched this program

Explain the current user's matching evidence.

## Things still to confirm

Unknown eligibility data.

## What could make you ineligible

When relevant.

## Documents you may need

Checklist.

## How to apply

Numbered steps.

## Official source

Clearly visible external source.

## Data status

For the current prototype clearly state:

**Source collected — not yet manually verified**

Do not visually imply government endorsement or verification.

Later, when actual manual review exists, support states such as:

- Manually reviewed
- Needs re-review
- Source unavailable

Store review metadata separately from the visual component.

---

# 6. APPLY FLOW

The prototype does not actually submit applications.

Make that impossible to misunderstand.

Instead of a misleading:

**Submit application**

use:

**Prepare application**

The flow can provide:

### Step 1
Application requirements

### Step 2
Document checklist

### Step 3
Draft personal statement

### Step 4
Official place to apply

At the final step say clearly:

**Nothing has been submitted.**

Provide:

**Open official application page**

where a real source exists.

The generated statement should remain editable.

Consider a browser-print-friendly version instead of introducing unnecessary PDF-generation complexity.

---

# 7. SAFETY UX

Safety is a first-class system, not a popup.

Keep the deterministic safety detection completely separate from the LLM.

When danger indicators are detected:

- interrupt normal conversational UI
- prioritize immediate safety information
- do not display normal match recommendations above safety information
- provide clear navigation to `/safety`
- never use cheerful animation
- never show celebratory UI

Maintain a permanent discreet:

**Quick exit**

button on sensitive flows.

Keyboard shortcut:

**Esc twice**

The action should:

- remove conversation state from application memory
- clear any sensitive sessionStorage used by Hamroh
- reset the matching session
- replace the current sensitive route
- navigate to a neutral safe page

Do not claim Hamroh can erase browser history if the browser does not allow that.

Test Quick Exit automatically.

---

# 8. PRIVACY UX

Privacy must be visible before the user shares information.

Create a compact privacy explanation near the beginning:

**Hamroh does not create a personal profile from your story.**

Explain exactly what happens with Gemini when Gemini is active.

Do not store conversation text in:

- query parameters
- URLs
- analytics events
- localStorage
- error tracking payloads
- browser logs

Prefer application memory for sensitive conversation state.

If sessionStorage is necessary, minimize its contents and wipe it with Quick Exit/session completion.

Do not add:

- Hotjar
- Microsoft Clarity session recording
- FullStory
- session replay software

Do not send sensitive conversation contents to analytics.

---

# 9. HOMEPAGE

Create a clean homepage with one clear job.

Suggested hierarchy:

## Hero

Headline:

**You don't have to figure out where to start alone.**

Short supporting text explaining Hamroh.

Primary CTA:

**Find support**

Secondary:

**Browse support programs**

Below the CTA show three trust points:

**No account required**

**Every result explains why**

**Official sources included**

Then:

### How Hamroh works

1. Tell us about your situation
2. Hamroh checks known programs
3. See why they may fit
4. Get practical next steps

Then:

### Important clarification

Hamroh helps discover possible support.

It does not make official eligibility decisions.

Then safety CTA.

Avoid making the homepage very long.

---

# 10. BROWSE PROGRAMS

Users should not be forced to use AI.

Provide a standalone program browser.

Support useful filters such as:

- category
- region
- provider
- support type
- target group
- verification/review status where appropriate

Search program names/descriptions.

Example categories:

- Financial support
- Children and family
- Disability support
- Legal help
- Employment
- Housing
- Crisis and safety
- Healthcare
- Education

Do not create categories that are unsupported by the actual dataset.

---

# 11. DESIGN SYSTEM

Build a small real design system instead of styling each page independently.

Create design tokens for:

- background
- foreground
- surface
- primary
- primary hover
- secondary
- muted
- border
- success
- warning
- danger
- focus ring
- matching statuses

Recommended visual direction:

Warm neutral background.

White/light surfaces.

Deep teal or calm green as the primary brand family.

Amber only where attention is necessary.

Red reserved mainly for danger/safety.

Do not use red for ordinary validation unless appropriate.

Avoid making match-status colors the only way to understand status.

Use icon + label + color.

Use generous spacing.

Prefer:

- 8px spacing system
- 12–18px surface radius
- subtle borders
- limited shadows
- readable line length
- 16px minimum normal body text
- strong typographic hierarchy

Typography:

Use a font with excellent Latin + Cyrillic coverage.

Good choices:

- Inter
- Noto Sans

Do not use five different font families.

---

# 12. COMPONENT SYSTEM

Build reusable components such as:

- AppHeader
- LanguageSwitcher
- QuickExitButton
- PrivacyNotice
- AIProviderNotice
- SafetyBanner
- PageContainer
- SectionHeading
- ConversationMessage
- SuggestedAnswerChips
- ConversationComposer
- ConversationProgress
- MatchBadge
- MatchCard
- MatchReasonList
- ProgramCard
- ProgramSource
- VerificationStatus
- EligibilitySection
- DocumentChecklist
- ApplicationStep
- EmptyState
- ErrorState
- Skeleton
- ConfirmDialog
- MobileBottomAction
- Footer

Do not create enormous 800-line page components.

Separate:

UI components

from

business/matching logic.

---

# 13. RECOMMENDED LIBRARIES

First inspect the existing project.

Do not migrate frameworks merely to satisfy this goal.

### UI

Use:

**Tailwind CSS**

for styling if the project already uses it or migration is small.

Use:

**shadcn/ui**

for editable application-owned component implementations.

Use:

**Radix UI primitives**

where accessible low-level interaction primitives are required.

Do not blindly install every shadcn component.

Install only components used by Hamroh.

Likely useful:

- Button
- Card
- Dialog
- Alert Dialog
- Sheet
- Select
- Tabs
- Accordion
- Tooltip
- Dropdown Menu
- Command / Combobox
- Checkbox
- Radio Group
- Textarea
- Input
- Badge
- Progress where semantically appropriate
- Skeleton

---

### Icons

Use:

**lucide-react**

Use icons consistently.

Do not mix Lucide, Material Icons and random SVG icon packs.

Icons must not replace labels for important actions such as:

Quick Exit.

---

### Motion

Use:

**motion**

Import from:

`motion/react`

Use motion for:

- page entrance
- card appearance
- accordion/layout transitions
- button feedback
- conversation message entrance
- results reveal
- lightweight loading transitions

Animation should usually remain around roughly 150–300ms.

Avoid:

- large parallax
- constant floating elements
- excessive spring bouncing
- long page transition sequences

Never allow visual effects to slow a person who needs support.

Honor:

`prefers-reduced-motion`.

Safety flows should use minimal/no decorative motion.

---

### Forms

Use:

**react-hook-form**

with:

**zod**

and:

**@hookform/resolvers**

Use one shared schema where appropriate instead of duplicating frontend validation rules.

Do not move eligibility business rules into Zod.

Zod validates structure/input.

`matching.ts` determines program matching.

---

### Internationalization

If this is Next.js:

Use:

**next-intl**

If this is plain React/Vite:

Use:

**react-i18next**

Do not hardcode user-facing strings in JSX.

Everything user-facing must have:

- Uzbek
- Russian
- English

including:

- errors
- empty states
- form validation
- buttons
- safety content
- match labels
- Gemini disclosure
- loading messages

Check long Russian labels and mobile wrapping manually.

---

### Server state

If multiple backend endpoints are being fetched and server-state complexity justifies it, use:

**@tanstack/react-query**

for:

- program retrieval
- source data
- API request state
- retries where safe
- caching non-sensitive public program data

Do NOT cache sensitive conversation data in TanStack Query unless there is a strong reason.

For sensitive client state, keep the design intentionally simple.

Prefer:

React state / Context / reducer

over adding a global state library solely because it is fashionable.

---

### Notifications

Use:

**Sonner**

for ordinary non-critical toast notifications.

Never put important eligibility or safety information only in a toast.

---

# 14. MOTION DESIGN SYSTEM

Motion should communicate state.

Not decoration.

Examples:

### Starting conversation
Composer smoothly changes to active state.

### Assistant response
Small opacity + vertical entrance.

### Matching
Show deterministic progress states:

“Checking program requirements”

“Comparing your answers”

“Preparing explanations”

Do not pretend the AI is “thinking.”

### Results
Stagger cards very slightly.

### Expanding match explanation
Use layout animation.

### Completing checklist item
Use small visual confirmation.

### Quick Exit
No elaborate animation.

Exit immediately.

Create reusable animation variants instead of defining random animations in every component.

---

# 15. RESPONSIVE DESIGN

Design mobile-first.

Test at minimum around:

- 360px
- 390px
- 768px
- 1024px
- 1440px+

Important:

The application must be fully usable one-handed on a phone.

Avoid small click targets.

On mobile:

- use bottom sheets when appropriate
- keep primary actions reachable
- avoid sidebars consuming space
- stack match information clearly

On desktop:

Do not simply stretch mobile content across 1600 pixels.

Keep readable content widths.

Conversation pages may use a restrained two-column layout only when the second column adds useful context.

---

# 16. ACCESSIBILITY

Target:

**WCAG 2.2 AA**

Requirements include:

- full keyboard navigation
- visible focus indicators
- semantic headings
- actual button elements for buttons
- actual links for navigation
- meaningful accessible names
- form labels
- screen-reader friendly error messages
- proper dialog focus management
- sufficient text contrast
- sufficient control contrast
- minimum reasonable pointer target sizes
- no information communicated only by color
- reduced-motion support
- logical tab order
- skip-to-content support
- status updates announced appropriately

Do not remove outlines unless replaced with a better visible focus state.

Run automated accessibility tests.

Manual keyboard testing is still required.

---

# 17. EMPTY, LOADING AND FAILURE STATES

Every important screen must intentionally support:

## Loading

Use calm skeleton states.

Do not show giant spinners for everything.

## No matches

Never say:

“No help is available.”

Say that Hamroh could not identify a matching program from the current dataset/information.

Provide:

- change answers
- browse all programs
- official resources
- safety resources where relevant

## Network error

Explain that the user's eligibility has not changed; Hamroh simply could not load information.

Allow retry.

## Gemini unavailable

Fall back to deterministic guided mode if supported.

Do not block the user from the program database.

## Missing program source

Clearly mark the source as currently unavailable rather than inventing one.

---

# 18. DATA TRANSPARENCY

Every program record should support structured provenance metadata.

Where compatible with the current codebase, organize fields around concepts like:

- id
- localized title
- provider
- category
- regions
- description
- support provided
- eligibility conditions
- required documents
- application method
- sourceUrl
- source organization
- source retrieval/review date
- verification/review status

Do not modify the underlying matching contract merely for UI convenience.

Clearly distinguish:

**Source exists**

from:

**Source manually reviewed**

from:

**Eligibility officially confirmed**

These mean different things.

---

# 19. CAPSTONE DEMO EXPERIENCE

Create an experience that is easy to demonstrate to professors.

Optional but strongly recommended:

Add a clearly labelled:

**Try a demo situation**

section on the landing page.

Example fictional scenarios might demonstrate:

- single parent looking for financial support
- family caring for a child with disability
- person asking for legal support

Never make a dangerous/abuse scenario into a playful demo.

Demo scenarios must be labelled fictional.

This lets us demonstrate matching quickly without typing a large story during the presentation.

---

# 20. TRUST / “HOW HAMROH WORKS”

Create a small public explanation page.

Explain the system visually:

User story
↓
Conversation assistant
↓
Structured facts
↓
Deterministic matching rules
↓
Known program database
↓
Explanation + next steps

Make it very clear:

**The language model does not create programs or decide eligibility.**

This is an important differentiator and an excellent capstone presentation point.

---

# 21. DO NOT DAMAGE EXISTING LOGIC

Before changing code:

Inspect:

- project structure
- current routes
- current components
- `matching.ts`
- safety logic
- Gemini integration
- scripted fallback
- program schema
- storage behavior
- translation implementation
- apply flow
- tests

Document the current architecture.

Then make a redesign plan.

Do not replace correct deterministic logic with an LLM.

Do not move safety detection into Gemini.

Do not let Gemini return arbitrary program IDs without deterministic validation.

Do not introduce a database storing private conversations.

---

# 22. TESTING STACK

Use the project's existing testing tools where possible.

For unit/component testing use the existing framework, typically:

- Vitest
- React Testing Library

For end-to-end testing use:

**Playwright**

Add:

**@axe-core/playwright**

for automated accessibility checks.

Important E2E scenarios:

1. User changes language.
2. Uzbek conversation works.
3. Russian conversation works.
4. English conversation works.
5. User completes normal matching.
6. Match explanations correspond to deterministic output.
7. No percentages are displayed.
8. Official program source is accessible.
9. Missing information results in More information needed.
10. Apply flow clearly says nothing was submitted.
11. Safety phrase triggers deterministic safety experience.
12. Quick Exit works.
13. Esc twice triggers Quick Exit.
14. Quick Exit removes sensitive application state.
15. Sensitive text never appears in URL.
16. Refresh behavior matches the privacy contract.
17. Gemini unavailable gracefully falls back where supported.
18. Keyboard-only user can complete major flows.
19. Main pages have no automated critical accessibility violations.
20. Mobile navigation works correctly.

---

# 23. PERFORMANCE

Do not trade speed for visual effects.

Targets for main user flows:

- fast initial rendering
- no unnecessary large JavaScript libraries
- no giant background videos
- no oversized images
- no layout shifts caused by loading states
- lazy-load non-critical content
- keep animations GPU-friendly
- avoid unnecessary re-renders

Use Lighthouse during validation.

Aim for strong production-level results, especially:

- Accessibility
- Best Practices
- Performance

Do not manipulate the application only to produce an artificial Lighthouse score.

---

# 24. CONTENT WRITING

Rewrite confusing UI text.

Use plain, compassionate language.

Avoid bureaucratic phrases.

Avoid:

“Based on analysis of eligibility parameters...”

Prefer:

“Based on what you've told us, these programs may be worth checking.”

Avoid:

“You qualify.”

Prefer:

“This looks like a strong potential match.”

Avoid:

“No programs available.”

Prefer:

“We couldn't find a clear match from the programs Hamroh currently knows about.”

Never sound certain when Hamroh does not actually know.

---

# 25. FOLDER / ARCHITECTURE QUALITY

Keep a maintainable structure similar to the existing architecture.

A reasonable conceptual separation is:

`components/ui`
Generic design-system components

`components/hamroh`
Product-specific reusable components

`features/chat`
Conversation experience

`features/matching`
Match-result presentation

`features/programs`
Program browsing/details

`features/safety`
Safety experience

`features/apply`
Application preparation

`lib`
Shared utilities

`i18n`
Translations

`data`
Program data where currently appropriate

`tests`
Unit/E2E tests

Do not reorganize the entire repository just to match this example.

Respect the existing codebase.

---

# 26. IMPLEMENTATION ORDER

Work in phases.

## Phase 1 — Audit

Inspect the entire application.

Create a list of:

- existing pages
- broken/inconsistent UX
- accessibility issues
- mobile issues
- duplicated components
- privacy problems
- unclear text
- missing states

## Phase 2 — Design foundation

Create:

- tokens
- typography
- colors
- spacing
- components
- app shell
- header/footer
- language selector
- Quick Exit

## Phase 3 — Core journey

Redesign:

Landing
→ Conversation
→ Matching
→ Results
→ Program details
→ Next steps

## Phase 4 — Safety/privacy

Complete:

- safety experience
- privacy disclosure
- Gemini disclosure
- Quick Exit
- session cleanup

## Phase 5 — Secondary flows

Complete:

- Browse Programs
- Apply preparation
- source information
- About / How Hamroh Works

## Phase 6 — Motion

Add subtle system-level motion only after the static UX is correct.

## Phase 7 — QA

Test:

- three languages
- keyboard
- screen sizes
- errors
- safety
- privacy
- accessibility
- E2E flows

---

# 27. DEFINITION OF DONE

Do not consider this task complete because the homepage looks attractive.

The redesign is complete only when:

- the primary user journey feels coherent end-to-end
- all major pages use one visual system
- mobile UX is complete
- Uzbek, Russian and English are complete
- no eligibility percentages exist
- match reasons are understandable
- every program exposes its source
- unreviewed programs are honestly labelled
- AI does not determine eligibility
- deterministic safety logic remains authoritative
- Quick Exit works
- sensitive conversation information is not placed in URLs
- sensitive conversations are not persisted unnecessarily
- Gemini disclosure is clear
- apply flow cannot be mistaken for real submission
- keyboard navigation works
- reduced motion works
- major pages pass automated accessibility checks
- normal loading/error/empty states exist
- automated tests cover critical flows
- no major console errors exist
- repository structure remains understandable
- current working business logic has not been silently broken

---

# 28. FINAL DELIVERABLE

At completion provide:

1. A short explanation of the new design direction.
2. Main UX improvements made.
3. Pages redesigned.
4. New reusable components.
5. Libraries added and why each was necessary.
6. Privacy improvements.
7. Safety improvements.
8. Accessibility improvements.
9. Responsive/mobile improvements.
10. Testing performed.
11. Screenshots or clear descriptions of major flows.
12. Known limitations remaining
13. Anything that still requires human verification.
14. Exact files containing critical matching/safety/privacy logic.

The result should look strong enough to present as a university capstone while remaining believable as a real product someone in Uzbekistan could actually use.