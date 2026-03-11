-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Backfill searchVector for any existing content_items
-- Columns "searchVector" and "embedding" were already created by prisma db push.
-- Note: Prisma preserves camelCase column names with double-quotes in PostgreSQL.
UPDATE content_items
SET "searchVector" =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('english', coalesce("rawContent", '')), 'C') ||
  setweight(to_tsvector('english', coalesce("authorName", '')), 'D');

-- GIN index for full-text search (fast @@ queries)
CREATE INDEX IF NOT EXISTS content_items_search_vector_idx
  ON content_items USING GIN("searchVector");

-- Auto-update trigger for searchVector on insert/update
CREATE OR REPLACE FUNCTION content_items_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."rawContent", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW."authorName", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_items_search_vector_trigger ON content_items;
CREATE TRIGGER content_items_search_vector_trigger
BEFORE INSERT OR UPDATE OF title, summary, "rawContent", "authorName"
ON content_items
FOR EACH ROW EXECUTE FUNCTION content_items_search_vector_update();

-- HNSW index for pgvector cosine similarity (schema-ready, embedding unfilled until post-MVP)
CREATE INDEX IF NOT EXISTS content_items_embedding_hnsw_idx
  ON content_items USING hnsw(embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;
