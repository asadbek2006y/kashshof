# Working on Hamroh

- Read `README.md` first. It explains the architecture split: the database decides what exists, `matching.ts` decides fit, and the assistant only handles language.
- Keep matching explainable: never add numeric match percentages. Every fit label must be backed by reasons.
- The assistant returns i18n keys, not prose. Every new key needs values in `apps/web/messages/{en,uz,ru}.json` (en.json is the typed source; uz/ru must mirror its shape).
- Vocabulary values (support types, regions, circumstances, documents) live in `apps/api/src/domain/vocabulary.ts`. Their labels live in the web message files.
- Never store what a person tells the assistant on the server. Never put it in URLs.
- Seed data is illustrative. Don't invent contact details, and don't mark anything verified without a real source.
- After API changes: `pnpm contract`, then `pnpm typecheck && pnpm lint && pnpm test`, then the Playwright suite.
