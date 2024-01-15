-- CreateTable
CREATE TABLE "regiondelivery" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "regiondelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demographicdistribution" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "age" TEXT NOT NULL,
    "gender" TEXT NOT NULL,

    CONSTRAINT "demographicdistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisherplatform" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "publisherplatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adcreativebodies" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "adcreativebodies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adcreativelinkcaptions" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "adcreativelinkcaptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adcreativelinkdescriptions" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "adcreativelinkdescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adcreativelinktitles" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "adcreativelinktitles_pkey" PRIMARY KEY ("id")
);
