/*
  Warnings:

  - You are about to drop the column `pythonID` on the `pythonendpointrow` table. All the data in the column will be lost.
  - Added the required column `pythonid` to the `pythonendpointrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pythonendpointrow" DROP COLUMN "pythonID",
ADD COLUMN     "pythonid" BIGINT NOT NULL;
