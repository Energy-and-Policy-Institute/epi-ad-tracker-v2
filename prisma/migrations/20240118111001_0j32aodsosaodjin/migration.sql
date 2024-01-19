-- CreateTable
CREATE TABLE "CountryRows" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "upperspend" INTEGER NOT NULL,
    "lowerspend" INTEGER NOT NULL,
    "numberOfAds" INTEGER NOT NULL,

    CONSTRAINT "CountryRows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRows" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "upperspend" INTEGER NOT NULL,
    "lowerspend" INTEGER NOT NULL,
    "numberOfAds" INTEGER NOT NULL,

    CONSTRAINT "CompanyRows_pkey" PRIMARY KEY ("id")
);
