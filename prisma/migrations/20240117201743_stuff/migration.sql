-- CreateTable
CREATE TABLE "CountryDataDump" (
    "id" SERIAL NOT NULL,
    "bigmap" TEXT NOT NULL,

    CONSTRAINT "CountryDataDump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyDataDump" (
    "id" SERIAL NOT NULL,
    "bigmap" TEXT NOT NULL,
    "companyname1" TEXT NOT NULL,

    CONSTRAINT "CompanyDataDump_pkey" PRIMARY KEY ("id")
);
