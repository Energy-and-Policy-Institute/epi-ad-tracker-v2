-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "pythonid" TEXT NOT NULL DEFAULT '',
    "ad_delivery_start_time" TEXT,
    "ad_delivery_stop_time" TEXT,
    "ad_snapshot_url" TEXT NOT NULL,
    "bylines" TEXT[],
    "delivery_by_region" JSONB,
    "demographic_distribution" JSONB,
    "publisher_platforms" TEXT[],
    "ad_creative_bodies" TEXT[],
    "ad_creative_link_captions" TEXT[],
    "ad_creative_link_descriptions" TEXT[],
    "ad_creative_link_titles" TEXT[],
    "page_name" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "impressions_lower_bound" INTEGER NOT NULL,
    "impressions_upper_bound" INTEGER NOT NULL,
    "spend_lower_bound" INTEGER NOT NULL,
    "spend_upper_bound" INTEGER NOT NULL,
    "ad_start_month" INTEGER NOT NULL,
    "ad_start_year" INTEGER NOT NULL,
    "frontGroupId" TEXT NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionalBreakdown" JSONB,
    "numAds" INTEGER NOT NULL,
    "adSpendLower" INTEGER NOT NULL,
    "adSpendUpper" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_frontGroupId_fkey" FOREIGN KEY ("frontGroupId") REFERENCES "FrontGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
