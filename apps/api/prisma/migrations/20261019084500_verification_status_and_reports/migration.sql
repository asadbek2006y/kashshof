-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INCORRECT_DETAILS', 'BROKEN_CONTACT', 'OUTDATED', 'NOT_OPERATING', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "verificationNote" TEXT;

-- CreateTable
CREATE TABLE "InfoReport" (
    "id" TEXT NOT NULL,
    "orgSlug" TEXT NOT NULL,
    "programId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InfoReport_status_createdAt_idx" ON "InfoReport"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "InfoReport" ADD CONSTRAINT "InfoReport_orgSlug_fkey" FOREIGN KEY ("orgSlug") REFERENCES "Organization"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
