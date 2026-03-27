/**
 * One-off: content_items count per content_source + totals.
 * Run: pnpm exec dotenv -e ../../.env -- tsx scripts/count-content-by-source.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const totalItems = await db.contentItem.count()
  const orphanItems = await db.contentItem.count({ where: { sourceId: null } })

  const bySource = await db.contentItem.groupBy({
    by: ['sourceId'],
    where: { sourceId: { not: null } },
    _count: { _all: true },
  })

  const sourceIds = bySource.map((r) => r.sourceId).filter(Boolean) as string[]
  const sources = await db.contentSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, name: true, platform: true, isActive: true },
  })
  const sourceById = new Map(sources.map((s) => [s.id, s]))

  const rows = bySource
    .map((r) => ({
      count: r._count._all,
      name: sourceById.get(r.sourceId!)?.name ?? '(unknown source id)',
      platform: sourceById.get(r.sourceId!)?.platform ?? '?',
      isActive: sourceById.get(r.sourceId!)?.isActive ?? false,
      sourceId: r.sourceId,
    }))
    .sort((a, b) => b.count - a.count)

  console.log('=== content_items (historical) ===')
  console.log(`Total rows in content_items: ${totalItems}`)
  console.log(`Rows with no sourceId: ${orphanItems}`)
  console.log('')

  console.log('Per source (active + inactive sources):')
  console.log(
    ['count', 'platform', 'active', 'name']
      .map((h) => h.padEnd(12))
      .join(''),
  )
  for (const row of rows) {
    console.log(
      [
        String(row.count).padEnd(12),
        String(row.platform).padEnd(12),
        String(row.isActive).padEnd(12),
        row.name,
      ].join(''),
    )
  }

  const sumKnown = rows.reduce((s, r) => s + r.count, 0)
  console.log('')
  console.log(`Sum of per-source counts: ${sumKnown} (+ ${orphanItems} orphan = ${sumKnown + orphanItems})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
