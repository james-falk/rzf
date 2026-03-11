import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const [players, aliases, rankings, trending] = await Promise.all([
  db.player.count(),
  db.playerAlias.count(),
  db.playerRanking.count(),
  db.trendingPlayer.count(),
])

console.log(`Players:  ${players.toLocaleString()}`)
console.log(`Aliases:  ${aliases.toLocaleString()}`)
console.log(`Rankings: ${rankings.toLocaleString()}`)
console.log(`Trending: ${trending.toLocaleString()}`)

// Spot-check Patrick Mahomes aliases
const mahomes = await db.player.findFirst({
  where: { firstName: 'Patrick', lastName: 'Mahomes' },
  include: { aliases: true },
})

if (mahomes) {
  console.log(`\nPatrick Mahomes (${mahomes.sleeperId}) aliases:`)
  mahomes.aliases.forEach((a) => console.log(`  [${a.aliasType}] ${a.alias}`))
} else {
  console.log('\nMahomes not found yet — still seeding')
}

await db.$disconnect()
