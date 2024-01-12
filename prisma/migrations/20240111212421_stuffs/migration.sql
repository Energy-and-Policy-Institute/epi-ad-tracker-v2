/*
  Warnings:

  - You are about to drop the `Generation1` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Generation1";

-- CreateTable
CREATE TABLE "generation1" (
    "id" SERIAL NOT NULL,
    "generationnumber" INTEGER NOT NULL,
    "generationnumber2" INTEGER NOT NULL,

    CONSTRAINT "generation1_pkey" PRIMARY KEY ("id")
);
