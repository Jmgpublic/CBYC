-- CreateTable
CREATE TABLE "Bulletin" (
    "id" TEXT NOT NULL,
    "msgTo" VARCHAR(50),
    "msgFrom" VARCHAR(50),
    "msg" VARCHAR(500) NOT NULL,
    "msgStart" TIMESTAMP(3) NOT NULL,
    "msgEnd" TIMESTAMP(3) NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN,
    "reviewer" VARCHAR(50),
    "dateReviewed" TIMESTAMP(3),

    CONSTRAINT "Bulletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bulletin_msgStart_msgEnd_idx" ON "Bulletin"("msgStart", "msgEnd");

-- AddForeignKey
ALTER TABLE "Bulletin" ADD CONSTRAINT "Bulletin_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
