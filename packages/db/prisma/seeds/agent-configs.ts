/**
 * Agent Config Seed
 *
 * Upserts per-agent content injection defaults into the AgentConfig table.
 * These values mirror the DEFAULTS constants in each agent file and make
 * the config visible + editable via the admin UI without a code deploy.
 *
 * Run:
 *   pnpm --filter @rzf/db exec tsx prisma/seeds/agent-configs.ts
 *
 * Safe to re-run — upserts by agentType so no duplicates.
 *
 * ─── Source tier guide ────────────────────────────────────────────────────────
 *   Tier 1: Rotowire NFL, Pro Football Talk (high-signal, time-critical)
 *   Tier 2: CBS Sports, ESPN, FantasyPros, The Ringer, Football Outsiders,
 *           4for4, NFL Trade Rumors, ESPN Fantasy YT, CBS Fantasy YT,
 *           FantasyPros Dynasty YT
 *   Tier 3: Flock Fantasy, Domain Fantasy Football (niche/general)
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const AGENT_SOURCE_CONFIGS = [
  {
    agentType: 'injury_watch',
    label: 'Injury Watch',
    description: 'Scan your starting lineup for injury risk and get handcuff recommendations',
    // Tier 1 only + RSS only: needs high-signal injury/depth chart updates.
    // YouTube and Tier 3 add noise for time-critical injury decisions.
    allowedSourceTiers: [1],
    allowedPlatforms: ['rss'],
    recencyWindowHours: 48,
    maxContentItems: 10,
    modelTier: 'haiku',
  },
  {
    agentType: 'lineup',
    label: 'Start / Sit',
    description: 'Optimized starting lineup with confidence scores and matchup analysis',
    // Tier 1+2 + RSS only: start/sit needs current injury + fantasy-specific
    // context (4for4, FantasyPros). No time for video research.
    allowedSourceTiers: [1, 2],
    allowedPlatforms: ['rss'],
    recencyWindowHours: 48,
    maxContentItems: 10,
    modelTier: 'haiku',
  },
  {
    agentType: 'waiver',
    label: 'Waiver Wire',
    description: 'Best available adds and drops tailored to your roster gaps',
    // Tier 1+2, RSS + YouTube: waiver wire videos are genuinely useful.
    // Tier 3 excluded to keep signal quality high.
    allowedSourceTiers: [1, 2],
    allowedPlatforms: ['rss', 'youtube'],
    recencyWindowHours: 72,
    maxContentItems: 12,
    modelTier: 'haiku',
  },
  {
    agentType: 'team_eval',
    label: 'Team Analysis',
    description: 'Full roster grade with position scores, strengths, weaknesses, and key insights',
    // Tier 1+2, all platforms: broad roster report benefits from quality
    // sources across both RSS and YouTube. Tier 3 excluded to reduce noise.
    allowedSourceTiers: [1, 2],
    allowedPlatforms: ['rss', 'youtube'],
    recencyWindowHours: 168,
    maxContentItems: 15,
    modelTier: 'sonnet',
  },
  {
    agentType: 'trade_analysis',
    label: 'Trade Advice',
    description: 'Accept or reject trade offers with detailed reasoning and counter-suggestions',
    // Tier 1+2, all platforms: dynasty/trade analysis benefits from
    // FantasyPros Dynasty and 4for4 YouTube deep-dives.
    allowedSourceTiers: [1, 2],
    allowedPlatforms: ['rss', 'youtube'],
    recencyWindowHours: 168,
    maxContentItems: 15,
    modelTier: 'sonnet',
  },
  {
    agentType: 'player_scout',
    label: 'Player Scout',
    description: 'Deep-dive scouting report on any player — trend, outlook, buy/sell signals',
    // All tiers + all platforms: deep-dive scouting needs maximum coverage.
    // Tier 3 niche channels can surface unique insights on specific players.
    allowedSourceTiers: [1, 2, 3],
    allowedPlatforms: ['rss', 'youtube'],
    recencyWindowHours: 168,
    maxContentItems: 15,
    modelTier: 'haiku',
  },
] as const

async function seed() {
  console.log('Seeding agent configs...\n')

  for (const config of AGENT_SOURCE_CONFIGS) {
    await db.agentConfig.upsert({
      where: { agentType: config.agentType },
      create: {
        agentType: config.agentType,
        label: config.label,
        description: config.description,
        systemPrompt: '',
        modelTier: config.modelTier,
        allowedSourceTiers: [...config.allowedSourceTiers],
        allowedPlatforms: [...config.allowedPlatforms],
        recencyWindowHours: config.recencyWindowHours,
        maxContentItems: config.maxContentItems,
        enabled: true,
        showInAnalyze: true,
      },
      update: {
        allowedSourceTiers: [...config.allowedSourceTiers],
        allowedPlatforms: [...config.allowedPlatforms],
        recencyWindowHours: config.recencyWindowHours,
        maxContentItems: config.maxContentItems,
      },
    })
    console.log(
      `  ✓ ${config.label} — tiers=[${config.allowedSourceTiers.join(',')}] platforms=[${config.allowedPlatforms.join(',')}] window=${config.recencyWindowHours}h max=${config.maxContentItems}`,
    )
  }

  const total = await db.agentConfig.count()
  console.log(`\nDone — ${total} agent config(s) in DB.`)
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
