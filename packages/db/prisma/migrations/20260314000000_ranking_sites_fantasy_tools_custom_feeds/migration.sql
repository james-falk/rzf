-- CreateTable: ranking_sites
CREATE TABLE IF NOT EXISTS "ranking_sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "logoUrl" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "popularityScore" INTEGER NOT NULL DEFAULT 5,
    "promoCode" TEXT,
    "promoDesc" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable: fantasy_tools
CREATE TABLE IF NOT EXISTS "fantasy_tools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "logoUrl" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priceType" TEXT NOT NULL,
    "price" TEXT,
    "promoCode" TEXT,
    "promoDesc" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "partnerTier" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fantasy_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable: custom_feeds
CREATE TABLE IF NOT EXISTS "custom_feeds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_feeds_userId_idx" ON "custom_feeds"("userId");

-- AddForeignKey
ALTER TABLE "custom_feeds" ADD CONSTRAINT "custom_feeds_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
