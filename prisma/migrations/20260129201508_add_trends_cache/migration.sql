-- CreateTable
CREATE TABLE "TrendsCache" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrendsCache_category_countryCode_key" ON "TrendsCache"("category", "countryCode");
