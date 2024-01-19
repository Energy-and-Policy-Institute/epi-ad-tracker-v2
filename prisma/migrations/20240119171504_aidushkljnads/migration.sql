/*
  Warnings:

  - You are about to alter the column `impressions_lower_bound` on the `pythonendpointrow` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `impressions_upper_bound` on the `pythonendpointrow` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `spend_lower_bound` on the `pythonendpointrow` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `spend_upper_bound` on the `pythonendpointrow` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "pythonendpointrow" ALTER COLUMN "impressions_lower_bound" SET DATA TYPE INTEGER,
ALTER COLUMN "impressions_upper_bound" SET DATA TYPE INTEGER,
ALTER COLUMN "spend_lower_bound" SET DATA TYPE INTEGER,
ALTER COLUMN "spend_upper_bound" SET DATA TYPE INTEGER;
