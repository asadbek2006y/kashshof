import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { directory, DIRECTORY_SOURCE, SECTION_SUPPORT_TYPES } from './directory-data';
import { loadResearch, RESEARCH_SOURCE } from './research-data';
import { organizations, programs, SEED_SOURCE } from './seed-data';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Development seed: upserts the prototype sample organizations and programs (prisma/seed-data.ts),
 * then merges the organization directory (prisma/directory-data.ts) by slug. Idempotent —
 * re-running refreshes the relative dates and leaves organization-dashboard drafts alone.
 */
async function main(): Promise<void> {
  // A hosted demo of the prototype may opt in explicitly; a real production database never should.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Refusing to run the prototype seed against production (set ALLOW_DEMO_SEED=true for a demo deployment).');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const now = Date.now();
  const research = loadResearch();
  const researched = new Set(research?.organizations.map((o) => o.slug) ?? []);

  try {
    for (const org of organizations) {
      const data = {
        name: org.name,
        description: org.description,
        categories: org.categories,
        verification: 'UNVERIFIED' as const,
        source: SEED_SOURCE,
        lastVerifiedAt: null,
      };
      await prisma.organization.upsert({ where: { slug: org.slug }, create: { slug: org.slug, ...data }, update: data });
    }

    // Invented sample programs are only seeded for organizations we have no research for, so
    // real and made-up programs never appear under the same name.
    for (const program of programs) {
      if (researched.has(program.orgSlug)) continue;
      const data = {
        orgSlug: program.orgSlug,
        title: program.title,
        summary: program.summary,
        howToApply: program.howToApply,
        supportTypes: program.supportTypes,
        genders: program.genders ?? [],
        ageMin: program.ageMin ?? null,
        ageMax: program.ageMax ?? null,
        regions: program.regions ?? [],
        targetCircumstances: program.targetCircumstances ?? [],
        requiredCircumstances: program.requiredCircumstances ?? [],
        incomeTested: program.incomeTested ?? false,
        requiredDocuments: program.requiredDocuments,
        applicationStatus: program.applicationStatus,
        deadline: program.deadlineInDays === undefined ? null : new Date(now + program.deadlineInDays * DAY_MS),
        statusVerifiedAt:
          program.statusCheckedDaysAgo === undefined ? null : new Date(now - program.statusCheckedDaysAgo * DAY_MS),
        isDraft: false,
      };
      await prisma.program.upsert({ where: { id: program.id }, create: { id: program.id, ...data }, update: data });
    }

    // Directory: organizations already seeded above keep their name, description and programs and
    // gain the list's sections; the rest are created with names only — nothing invented.
    let added = 0;
    for (const entry of directory) {
      const categories = [...new Set(entry.sections.flatMap((s) => SECTION_SUPPORT_TYPES[s] ?? []))];
      const existing = await prisma.organization.findUnique({ where: { slug: entry.slug } });
      if (existing) {
        await prisma.organization.update({
          where: { slug: entry.slug },
          data: {
            sections: entry.sections,
            kind: entry.kind,
            categories: [...new Set([...existing.categories, ...categories])],
          },
        });
      } else {
        added += 1;
        await prisma.organization.create({
          data: {
            slug: entry.slug,
            name: entry.name,
            description: {},
            categories,
            sections: entry.sections,
            kind: entry.kind,
            verification: 'UNVERIFIED',
            source: DIRECTORY_SOURCE,
          },
        });
      }
    }

    // Research: real contacts, descriptions and programs, each with its source.
    let researchedPrograms = 0;
    if (research) {
      const collectedAt = new Date(research.collectedAt);
      for (const org of research.organizations) {
        await prisma.program.deleteMany({ where: { orgSlug: org.slug, origin: 'SAMPLE', isDraft: false } });
        await prisma.organization.update({
          where: { slug: org.slug },
          data: {
            website: org.website,
            phone: org.phone,
            email: org.email,
            // No sourced description → empty, never the invented sample text.
            description: org.description ?? {},
            source: RESEARCH_SOURCE,
            sourceUrl: org.sourceUrl,
            researchedAt: collectedAt,
            hidden: org.hidden,
            reviewNote: org.reviewNote,
            verification: 'UNVERIFIED',
            lastVerifiedAt: null,
          },
        });
        for (const p of org.programs) {
          const data = {
            orgSlug: org.slug,
            title: p.title,
            summary: p.summary,
            howToApply: p.howToApply ?? undefined,
            supportTypes: p.supportTypes,
            genders: p.genders,
            ageMin: p.ageMin,
            ageMax: p.ageMax,
            regions: p.regions,
            targetCircumstances: p.targetCircumstances,
            requiredCircumstances: p.requiredCircumstances,
            incomeTested: p.incomeTested,
            requiredDocuments: p.requiredDocuments,
            applicationStatus: p.applicationStatus,
            deadline: p.deadline ? new Date(p.deadline) : null,
            // A status is only "checked" when the source actually stated one.
            statusVerifiedAt: p.applicationStatus === 'UNKNOWN' ? null : collectedAt,
            origin: 'RESEARCHED' as const,
            sourceUrl: p.sourceUrl,
            isDraft: false,
          };
          await prisma.program.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
          researchedPrograms += 1;
        }
      }
    }

    console.log(
      `Seeded ${organizations.length} sample organizations; directory: ${directory.length} organizations (${added} new); ` +
        `research: ${researched.size} organizations, ${researchedPrograms} programs.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
