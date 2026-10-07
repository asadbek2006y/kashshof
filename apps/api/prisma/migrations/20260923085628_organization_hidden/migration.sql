-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewNote" TEXT;
