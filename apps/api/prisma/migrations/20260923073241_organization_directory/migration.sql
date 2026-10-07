-- CreateEnum
CREATE TYPE "OrganizationKind" AS ENUM ('NGO', 'INTERNATIONAL', 'GOVERNMENT', 'PARTNER', 'GROUPING');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "kind" "OrganizationKind" NOT NULL DEFAULT 'NGO',
ADD COLUMN     "sections" TEXT[] DEFAULT ARRAY[]::TEXT[];
