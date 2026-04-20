/**
 * Content Re-Tagging Backfill Script
 *
 * Deletes all existing ContentPlayerMention rows and re-creates them using
 * the updated confidence-tiered tagging strategy:
 *
 *   - For articles (RSS/Reddit): title full-name match wins; falls back to
 *     body scan with strictMode (full names only).
 *   - For videos (YouTube): title full-name match wins; falls back to
 *     description with strictMode.
 *   - For ESPN articles: uses ESPN athlete category IDs if stored in mediaMeta.
 *
 * Usage:
 *   pnpm --filter @rzf/db tsx prisma/seeds/retag-content.ts
 *
 * Safe to re-run: deletes existing mentions per item then re-inserts.
 * Can be interrupted and resumed — processes in batches of 100.
 */

import { db } from '../src/index.js'
import { resolvePlayerMentions, extractSnippet, inferMentionContext } from '@rzf/shared'

const BATCH_SIZE = 100

async function main() {
  console.log('[retag] Loading active player aliases...')
  const aliases = await db.playerAlias.findMany({
    where: { player: { status: { not: 'Inactive' } } },
    select: { alias: true, playerId: true, aliasType: true },
  })
  console.log(`[retag] ${aliases.length} aliases loaded`)

  const totalItems = await db.contentItem.count()
  console.log(`[retag] ${totalItems} content items to process`)

  let processed = 0
  let totalMentionsDeleted = 0
  let totalMentionsCreated = 0
  let cursor: string | undefined

  while (true) {
    const items = await db.contentItem.findMany({
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        contentType: true,
        title: true,
        rawContent: true,
        mediaMeta: true,
        source: { select: { platform: true } },
      },
    })

    if (items.length === 0) break
    cursor = items[items.length - 1].id

    for (const item of items) {
      // Delete existing mentions for this item
      const deleted = await db.contentPlayerMention.deleteMany({ where: { contentId: item.id } })
      totalMentionsDeleted += deleted.count

      let playerIds: string[] = []

      // For ESPN articles, try to use ESPN athlete IDs from mediaMeta first
      const platform = item.source?.platform
      if (platform === 'api') {
        const meta = item.mediaMeta as Record<string, unknown>
        const espnAthleteIds = (meta?.espnAthleteIds as string[] | undefined) ?? []
        if (espnAthleteIds.length > 0) {
          const mappings = await db.playerExternalId.findMany({
            where: { source: 'espn', externalId: { in: espnAthleteIds } },
            select: { sleeperId: true },
          })
          playerIds = mappings.map((m) => m.sleeperId)
        }
      }

      // For all other content: title-first (loose: headlines are short, so
      // last-name-only matches are acceptable), then body with strictMode.
      if (playerIds.length === 0) {
        const titleMatches = resolvePlayerMentions(item.title, aliases, { strictMode: false })
        if (titleMatches.length > 0) {
          playerIds = titleMatches.map((m) => m.playerId)
        } else {
          const bodyMatches = resolvePlayerMentions(item.rawContent, aliases, { strictMode: true })
          playerIds = bodyMatches.map((m) => m.playerId)
        }
      }

      if (playerIds.length > 0) {
        await db.contentPlayerMention.createMany({
          data: playerIds.map((playerId) => {
            const fakeMatch = { playerId, alias: '', startIndex: 0, endIndex: 0 }
            const fullText = `${item.title}\n\n${item.rawContent}`
            const snippet = extractSnippet(fullText, fakeMatch, 200)
            return {
              contentId: item.id,
              playerId,
              context: inferMentionContext(snippet),
              snippet,
            }
          }),
          skipDuplicates: true,
        })
        totalMentionsCreated += playerIds.length
      }
    }

    processed += items.length
    console.log(`[retag] Progress: ${processed}/${totalItems} items processed — deleted=${totalMentionsDeleted} created=${totalMentionsCreated}`)
  }

  console.log(`[retag] Done — ${processed} items, ${totalMentionsDeleted} mentions removed, ${totalMentionsCreated} mentions created`)
  await db.$disconnect()
}

main().catch((err) => {
  console.error('[retag] Fatal error:', err)
  process.exit(1)
})
