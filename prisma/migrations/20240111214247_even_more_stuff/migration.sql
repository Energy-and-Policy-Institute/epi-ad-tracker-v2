/*
  Warnings:

  - Changed the type of `generationnumber` on the `generation1` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `generationnumber2` on the `generation1` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "generation1" DROP COLUMN "generationnumber",
ADD COLUMN     "generationnumber" BIGINT NOT NULL,
DROP COLUMN "generationnumber2",
ADD COLUMN     "generationnumber2" BIGINT NOT NULL;
