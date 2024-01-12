-- CreateTable
CREATE TABLE "generation" (
    "id" SERIAL NOT NULL,
    "generationNumber" INTEGER NOT NULL,
    "generationNumber2" INTEGER NOT NULL,

    CONSTRAINT "generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PythonEndpointRow" (
    "id" SERIAL NOT NULL,
    "generation" INTEGER NOT NULL,
    "pythonID" INTEGER NOT NULL,
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
    "impressions_lower_bound" INTEGER NOT NULL,
    "impressions_upper_bound" INTEGER NOT NULL,
    "spend_lower_bound" INTEGER NOT NULL,
    "spend_upper_bound" INTEGER NOT NULL,

    CONSTRAINT "PythonEndpointRow_pkey" PRIMARY KEY ("id")
);
