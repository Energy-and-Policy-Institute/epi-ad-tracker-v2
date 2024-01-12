/*
  Warnings:

  - You are about to drop the `Generation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Generation";

-- CreateTable
CREATE TABLE "Generation1" (
    "id" SERIAL NOT NULL,
    "generationnumber" INTEGER NOT NULL,
    "generationnumber2" INTEGER NOT NULL,

    CONSTRAINT "Generation1_pkey" PRIMARY KEY ("id")
);
