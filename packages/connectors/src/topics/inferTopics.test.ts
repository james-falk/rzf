/**
 * Golden-style checks for inferContentTopics (run with: npx tsx packages/connectors/src/topics/inferTopics.test.ts)
 */
import assert from 'node:assert/strict'
import { inferContentTopics } from './inferTopics.js'

function has(slug: string, text: string) {
  assert.ok(inferContentTopics(text).includes(slug), `expected ${slug} in: ${text.slice(0, 80)}`)
}

has('injury', 'Player questionable for Sunday injury report')
has('trade', 'Blockbuster trade deal announced')
has('free_agency', 'NFL free agency signing contract')
has('rookie_draft', 'NFL draft class mock draft first round')
has('nfl_combine', 'NFL combine 40-yard dash')
has('pro_day', 'Alabama pro day schedule')
has('playoffs', 'wild card weekend playoff game')
has('rankings', 'Week 12 consensus rankings tier list')

console.log('inferContentTopics golden checks: OK')
