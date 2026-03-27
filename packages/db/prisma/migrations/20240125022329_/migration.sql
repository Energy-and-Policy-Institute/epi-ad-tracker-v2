-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_frontGroupId_fkey";

-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "frontGroupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_frontGroupId_fkey" FOREIGN KEY ("frontGroupId") REFERENCES "FrontGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
