-- AlterTable
ALTER TABLE "air_quality_index" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "index" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "station" ALTER COLUMN "updated_at" DROP DEFAULT;
