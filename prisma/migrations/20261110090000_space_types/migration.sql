-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpaceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceType_name_key" ON "SpaceType"("name");

-- Seed the three types that were previously hard-coded, so existing spaces and charges keep a valid type.
INSERT INTO "SpaceType" ("id", "name", "isActive", "sortOrder", "createdAt")
VALUES
    (gen_random_uuid()::text, 'Residential Unit', true, 1, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Common Area', true, 2, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Office', true, 3, CURRENT_TIMESTAMP);
