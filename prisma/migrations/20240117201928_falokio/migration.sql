/*
  Warnings:

  - You are about to drop the `CompanyDataDump` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CompanyDataDump";

-- CreateTable
CREATE TABLE "CompanyDataDump1" (
    "id" SERIAL NOT NULL,
    "bigmap" TEXT NOT NULL,
    "companyname1" TEXT NOT NULL,

    CONSTRAINT "CompanyDataDump1_pkey" PRIMARY KEY ("id")
);
