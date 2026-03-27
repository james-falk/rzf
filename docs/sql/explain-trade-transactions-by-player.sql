-- EXPLAIN recent trade_transactions rows touching a Sleeper player id in adds/drops JSON.
-- Mirrors packages/agents/src/recent-trades-prompt.ts (JSONB ? operator).
-- Replace the two string literals below with one real Sleeper player id (digits only).

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, week, season, "leagueId", "createdAt"
FROM trade_transactions
WHERE adds::jsonb ? '0000000'
   OR drops::jsonb ? '0000000'
ORDER BY "createdAt" DESC
LIMIT 10;

-- If plans show sequential scans at scale, consider (after review):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_tx_adds_gin ON trade_transactions USING GIN ((adds::jsonb));
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_tx_drops_gin ON trade_transactions USING GIN ((drops::jsonb));
