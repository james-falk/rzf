/**
 * Seed script: populate YouTube content sources with top fantasy football channels.
 * Run: pnpm --filter @rzf/db exec dotenv -e ../../.env -- tsx prisma/seed-youtube.ts
 *
 * channelId: from the channel URL (e.g. youtube.com/channel/{id} or /c/{handle})
 * The upload playlist ID will be resolved and cached on first youtube_refresh run.
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const YOUTUBE_CHANNELS = [
  { name: 'The Fantasy Footballers', channelId: 'UCnoHDX3YkCPfkTHLOYCdsBQ' },
  { name: 'Establish the Run', channelId: 'UCScCkMXMx7q0OM0RbJMWTDA' },
  { name: 'PFF Fantasy Football', channelId: 'UCv6sExHzPqBeNnqQyIjd5bA' },
  { name: 'FantasyPros', channelId: 'UCHhS7VPIWTe5c4SeMqTHhFg' },
  { name: 'JJ Zachariason (Late Round Capital)', channelId: 'UCNJBy0xMHjHd7F4RqisFKaw' },
  { name: 'Kyle Dvorchak (Fantasy Football Today)', channelId: 'UCCLhDi88UD36EB6uSF1VKMQ' },
  { name: 'CBS Sports Fantasy Football', channelId: 'UCFbCLm1ZJuJHHaXQjOHYgig' },
  { name: 'ESPN Fantasy Sports', channelId: 'UCAK8g7FKFkrfpfFAH_GcXmQ' },
  { name: 'Rotoballer Fantasy Football', channelId: 'UCN5rnIPXM4Kc8Bm8T5p6UCQ' },
  { name: 'Fantasy Football Today (CBSSports)', channelId: 'UCBNJGCLm1ZJuJHHaXQjOHYgig' },
  { name: 'Scott Fish (SFB)', channelId: 'UCBW_HHDMY4aH10M9V4ZjF2Q' },
  { name: 'Banged Up Bills', channelId: 'UCIsgMz9HZIGFSmzLqtOFO1g' },
  { name: 'The Jonah Tui Dynasty', channelId: 'UCp1jHHdBhBWiGLMRRwmBSrw' },
  { name: 'FantasyPros Dynasty', channelId: 'UCHhS7VPIWTe5c4SeMqTHhFg' },
  { name: 'Sleeper Fantasy', channelId: 'UCxW4D0-K5NG9r3oJpSJLAXQ' },
  { name: 'Matthew Berry (Fantasy Life)', channelId: 'UCfpVXWCwVpIjGnmRWdFtVfQ' },
  { name: 'Ian Hartitz (Established the Run)', channelId: 'UCvdl1hO9l3rSS4R0eR71y3A' },
  { name: 'RotoBaller Dynasty', channelId: 'UCm5b4T1mIzVLQMWc3vBrqXA' },
  { name: 'RotoUnderworld', channelId: 'UCY1ynY4eB0sJaEpUH_p7eSg' },
  { name: 'Rotoworld NFL', channelId: 'UCxh0FjEnMjBsTGpvDH8mH5g' },
  { name: 'NFL Fantasy Football', channelId: 'UCVjOmNkNXXpQMd7LcB4ITMQ' },
  { name: 'The Fantasy Footballers Advice', channelId: 'UCjPXmXQeHBsFKDgEcAr0L4A' },
  { name: 'Underdog Fantasy', channelId: 'UCIQDQIJPpD94LgGvTY4eNwQ' },
  { name: '4for4 Fantasy Football', channelId: 'UCyq56KOEzJBx0C_eRUy4t8A' },
  { name: 'The Footballers Podcast', channelId: 'UCi-0ixnLCpVQkfkJvdpJFSQ' },
]

async function main() {
  console.log(`Seeding ${YOUTUBE_CHANNELS.length} YouTube channels...`)

  let seeded = 0
  let skipped = 0

  for (const channel of YOUTUBE_CHANNELS) {
    try {
      await db.contentSource.upsert({
        where: {
          platform_feedUrl: {
            platform: 'youtube',
            feedUrl: channel.channelId,
          },
        },
        create: {
          name: channel.name,
          platform: 'youtube',
          feedUrl: channel.channelId,
          platformConfig: { channelId: channel.channelId },
          refreshIntervalMins: 120, // 2 hours
          isActive: true,
        },
        update: {
          name: channel.name,
          platformConfig: { channelId: channel.channelId },
          refreshIntervalMins: 120,
        },
      })
      seeded++
      console.log(`  ✓ ${channel.name}`)
    } catch (err) {
      console.error(`  ✗ ${channel.name}: ${err instanceof Error ? err.message : String(err)}`)
      skipped++
    }
  }

  console.log(`\nDone — ${seeded} seeded, ${skipped} skipped`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
