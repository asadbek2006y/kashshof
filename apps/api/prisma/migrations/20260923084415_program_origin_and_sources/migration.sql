-- CreateEnum
CREATE TYPE "ProgramOrigin" AS ENUM ('SAMPLE', 'RESEARCHED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "researchedAt" TIMESTAMP(3),
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "origin" "ProgramOrigin" NOT NULL DEFAULT 'SAMPLE',
ADD COLUMN     "sourceUrl" TEXT;
