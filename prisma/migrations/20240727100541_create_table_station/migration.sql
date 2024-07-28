-- CreateTable
CREATE TABLE "station" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "commune_name" TEXT,
    "district_name" TEXT NOT NULL,
    "province_name" TEXT NOT NULL,
    "address_street" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "station_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "air_quality_index" ADD CONSTRAINT "air_quality_index_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
