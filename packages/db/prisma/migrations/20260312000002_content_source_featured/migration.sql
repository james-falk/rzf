-- Add partner/featured fields to content_sources
ALTER TABLE "content_sources" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "content_sources" ADD COLUMN "partnerTier" TEXT;
