-- CreateTable
CREATE TABLE "pythonendpointrow1" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonid" BIGINT NOT NULL,
    "ad_delivery_start_time" TIMESTAMP(3) NOT NULL,
    "ad_delivery_stop_time" TIMESTAMP(3) NOT NULL,
    "ad_snapshot_url" TEXT NOT NULL,
    "bylines" TEXT NOT NULL,
    "delivery_by_region" TEXT,
    "demographic_distribution" TEXT,
    "publisher_platforms" TEXT,
    "ad_creative_bodies" TEXT,
    "ad_creative_link_captions" TEXT,
    "ad_creative_link_descriptions" TEXT,
    "ad_creative_link_titles" TEXT,
    "page_name" TEXT NOT NULL,
    "page_id" BIGINT NOT NULL,
    "impressions_lower_bound" BIGINT NOT NULL,
    "impressions_upper_bound" BIGINT NOT NULL,
    "spend_lower_bound" BIGINT NOT NULL,
    "spend_upper_bound" BIGINT NOT NULL,

    CONSTRAINT "pythonendpointrow1_pkey" PRIMARY KEY ("id")
);
