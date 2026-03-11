/**
 * One-off RSS connector test.
 * Reads active sources from DB, fetches feeds, inserts new ContentItems.
 *
 * Run from workspace root:
 *   pnpm --filter @rzf/connectors exec dotenv -e ../../.env -- tsx scripts/test-rss.ts
 */

import { RSSConnector } from '../src/rss/index.js'

console.log('=== RSS Connector Test ===\n')

const result = await RSSConnector.run()

console.log('\n=== Result ===')
console.log(`Sources processed : ${result.sources}`)
console.log(`New items inserted: ${result.inserted}`)

if (result.errors.length > 0) {
  console.log(`\nErrors (${result.errors.length}):`)
  for (const e of result.errors) {
    console.log(`  ✗ ${e.source}: ${e.message}`)
  }
} else {
  console.log('\nNo errors.')
}
