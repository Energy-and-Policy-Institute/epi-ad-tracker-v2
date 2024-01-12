/*
  Warnings:

  - You are about to drop the `generation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "generation";

-- CreateTable
CREATE TABLE "Generation" (
    "id" SERIAL NOT NULL,
    "generationNumber" INTEGER NOT NULL,
    "generationNumber2" INTEGER NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);
