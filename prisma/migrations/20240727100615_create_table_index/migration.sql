-- CreateTable
CREATE TABLE "index" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "index_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "air_quality_index" ADD CONSTRAINT "air_quality_index_index_id_fkey" FOREIGN KEY ("index_id") REFERENCES "index"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
