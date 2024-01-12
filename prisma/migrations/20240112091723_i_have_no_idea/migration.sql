/*
  Warnings:

  - You are about to drop the `PythonEndpointRow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PythonEndpointRow";

-- CreateTable
CREATE TABLE "pythonendpointrow" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonID" BIGINT NOT NULL,
    "ad_delivery_start_time" TIMESTAMP(3) NOT NULL,
    "ad_delivery_stop_time" TIMESTAMP(3) NOT NULL,
    "ad_snapshot_url" TEXT NOT NULL,
    "bylines" TEXT NOT NULL,
    "delivery_by_region" JSONB[],
    "demographic_distribution" JSONB[],
    "publisher_platforms" JSONB[],
    "ad_creative_bodies" JSONB[],
    "ad_creative_link_captions" JSONB[],
    "ad_creative_link_descriptions" JSONB[],
    "ad_creative_link_titles" JSONB[],
    "page_name" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "impressions_lower_bound" BIGINT NOT NULL,
    "impressions_upper_bound" BIGINT NOT NULL,
    "spend_lower_bound" BIGINT NOT NULL,
    "spend_upper_bound" BIGINT NOT NULL,

    CONSTRAINT "pythonendpointrow_pkey" PRIMARY KEY ("id")
);
