-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('OPEN', 'CLOSED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Organization" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "categories" TEXT[],
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "verification" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "source" TEXT NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "orgSlug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "howToApply" JSONB,
    "supportTypes" TEXT[],
    "genders" TEXT[],
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "regions" TEXT[],
    "targetCircumstances" TEXT[],
    "requiredCircumstances" TEXT[],
    "incomeTested" BOOLEAN NOT NULL DEFAULT false,
    "requiredDocuments" TEXT[],
    "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'UNKNOWN',
    "deadline" TIMESTAMP(3),
    "statusVerifiedAt" TIMESTAMP(3),
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Program_orgSlug_idx" ON "Program"("orgSlug");

-- CreateIndex
CREATE INDEX "Program_isDraft_idx" ON "Program"("isDraft");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_orgSlug_fkey" FOREIGN KEY ("orgSlug") REFERENCES "Organization"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
