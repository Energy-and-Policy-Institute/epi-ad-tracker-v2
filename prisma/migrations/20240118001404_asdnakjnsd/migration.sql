-- AlterTable
ALTER TABLE "pythonendpointrow" ALTER COLUMN "ad_delivery_start_time" DROP NOT NULL,
ALTER COLUMN "ad_delivery_start_time" SET DATA TYPE TEXT,
ALTER COLUMN "ad_delivery_stop_time" DROP NOT NULL,
ALTER COLUMN "ad_delivery_stop_time" SET DATA TYPE TEXT;
