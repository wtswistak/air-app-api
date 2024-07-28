-- CreateTable
CREATE TABLE "air_quality_index" (
    "id" UUID NOT NULL,
    "station_id" INTEGER NOT NULL,
    "index_id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "measurement_time" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "air_quality_index_pkey" PRIMARY KEY ("id")
);
