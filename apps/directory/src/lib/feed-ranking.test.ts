/**
 * Unit tests for tierWeightedScore (run with: npx tsx apps/directory/src/lib/feed-ranking.test.ts)
 */
import assert from 'node:assert/strict'
import { tierWeightedScore } from './feed-ranking.js'

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 3_600_000)
const twoHoursAgo = new Date(now.getTime() - 7_200_000)

// Tier 1 scores strictly higher than Tier 3 for same-hour items
assert.ok(
  tierWeightedScore(1, oneHourAgo) > tierWeightedScore(3, oneHourAgo),
  'Tier 1 should score higher than Tier 3 for same-age item',
)

// Newer items score higher than older items within the same tier
assert.ok(
  tierWeightedScore(2, oneHourAgo) > tierWeightedScore(2, twoHoursAgo),
  'Newer item should score higher than older item at same tier',
)

// null/undefined tier defaults to Tier 3 weight (1.0)
assert.strictEqual(
  tierWeightedScore(null, oneHourAgo),
  tierWeightedScore(3, oneHourAgo),
  'null tier should equal Tier 3 score',
)
assert.strictEqual(
  tierWeightedScore(undefined, oneHourAgo),
  tierWeightedScore(3, oneHourAgo),
  'undefined tier should equal Tier 3 score',
)

console.log('feed-ranking tierWeightedScore tests: OK')
