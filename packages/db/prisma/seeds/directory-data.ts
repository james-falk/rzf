/**
 * Directory Data Seed — RankingSite + FantasyTool
 *
 * Seeds the ranking_sites and fantasy_tools tables with initial curated entries.
 * Safe to re-run — upserts by (name, url).
 *
 * Run:
 *   pnpm --filter @rzf/db exec tsx prisma/seeds/directory-data.ts
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── Ranking Sites ────────────────────────────────────────────────────────────

const RANKING_SITES = [
  {
    name: 'FantasyPros',
    description: 'Consensus rankings aggregated from 100+ fantasy analysts. The industry standard for rankings, projections, and expert picks.',
    url: 'https://www.fantasypros.com',
    categories: ['Redraft', 'Dynasty', 'DFS', 'Best Ball'],
    popularityScore: 10,
    featured: true,
    isActive: true,
  },
  {
    name: 'ESPN Fantasy',
    description: 'Rankings, projections, and analysis from ESPN\'s team of fantasy analysts. Integrated with the ESPN fantasy platform.',
    url: 'https://www.espn.com/fantasy/football/',
    categories: ['Redraft'],
    popularityScore: 9,
    featured: false,
    isActive: true,
  },
  {
    name: '4for4 Fantasy Football',
    description: 'Data-driven rankings and projections with a focus on PPR and target share analysis. Premium subscription required for full access.',
    url: 'https://www.4for4.com',
    categories: ['Redraft', 'DFS'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'The Athletic Fantasy Football',
    description: 'In-depth analysis and rankings from a team of veteran fantasy writers. Beat-writer insight you can\'t get elsewhere.',
    url: 'https://theathletic.com/fantasy-football/',
    categories: ['Redraft', 'Dynasty'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'RotoWire',
    description: 'Expert rankings, injury news, and projections updated in real time throughout the week.',
    url: 'https://www.rotowire.com/football/',
    categories: ['Redraft', 'DFS'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'FantasyCalc',
    description: 'Dynasty trade values powered by community trade data. Best-in-class dynasty startup rankings and pick values.',
    url: 'https://fantasycalc.com',
    categories: ['Dynasty'],
    popularityScore: 9,
    featured: false,
    isActive: true,
  },
  {
    name: 'Dynasty Daddy',
    description: 'Dynasty-focused rankings, trade calculators, and community trade volume data for startup and in-season decisions.',
    url: 'https://dynastydaddy.com',
    categories: ['Dynasty'],
    popularityScore: 7,
    featured: false,
    isActive: true,
  },
  {
    name: 'Underdog Fantasy ADP',
    description: 'Best Ball ADP and draft trends from Underdog Fantasy — the largest best ball platform in the industry.',
    url: 'https://underdogfantasy.com',
    categories: ['Best Ball', 'Redraft'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'DraftKings Fantasy Rankings',
    description: 'DFS salary-based rankings and ownership projections for DraftKings contests.',
    url: 'https://www.draftkings.com/lineup/rankings',
    categories: ['DFS'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'FanDuel Fantasy Rankings',
    description: 'FanDuel salary rankings, matchup analysis, and projected ownership for GPP and cash game strategy.',
    url: 'https://www.fanduel.com/fantasy-football-rankings',
    categories: ['DFS'],
    popularityScore: 7,
    featured: false,
    isActive: true,
  },
  {
    name: 'Sleeper ADP',
    description: 'Draft position trends from millions of Sleeper leagues. Consensus ADP across all formats and scoring systems.',
    url: 'https://sleeper.com/adp/nfl',
    categories: ['Redraft', 'Dynasty', 'Best Ball'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'NumberFire',
    description: 'Stat-model based projections and rankings. Strong on efficiency metrics and target share analytics.',
    url: 'https://www.numberfire.com/nfl/fantasy',
    categories: ['Redraft', 'DFS'],
    popularityScore: 6,
    featured: false,
    isActive: true,
  },
  {
    name: 'PFF Fantasy',
    description: 'Pro Football Focus grades and rankings. Unique coverage of snap counts, routes, and target quality.',
    url: 'https://www.pff.com/fantasy',
    categories: ['Redraft', 'Dynasty', 'DFS'],
    popularityScore: 8,
    featured: false,
    isActive: true,
  },
  {
    name: 'KeepTradeCut',
    description: 'Community-voted dynasty rankings and trade values. Thousands of votes per week to surface the most accurate dynasty consensus.',
    url: 'https://keeptradecut.com',
    categories: ['Dynasty'],
    popularityScore: 9,
    featured: false,
    isActive: true,
  },
]

// ─── Fantasy Tools ────────────────────────────────────────────────────────────

const FANTASY_TOOLS = [
  {
    name: 'RosterMind AI',
    description: 'AI-powered fantasy football analyst built on Red Zone Fantasy data. Get trade analysis, waiver wire advice, lineup help, and player scouting reports in seconds.',
    url: process.env['NEXT_PUBLIC_ROSTERMIND_URL'] ?? 'https://rostermind.vercel.app',
    categories: ['AI', 'Trade Analysis', 'Roster Mgmt'],
    priceType: 'freemium',
    price: '$20/mo',
    featured: true,
    partnerTier: 'gold',
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'FantasyPros Draft Wizard',
    description: 'Live draft assistant with AI-powered pick recommendations, auto-pick mode, and real-time ADP guidance.',
    url: 'https://www.fantasypros.com/nfl/draft-wizard.php',
    categories: ['Rankings', 'AI'],
    priceType: 'freemium',
    price: '$9.99/mo',
    featured: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'FantasyCalc Trade Calculator',
    description: 'Dynasty trade calculator powered by live community trade data. See whether you\'re winning or losing any trade in seconds.',
    url: 'https://fantasycalc.com/trade-calculator',
    categories: ['Trade Analysis', 'Dynasty'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Sleeper',
    description: 'The #1 fantasy football app with the cleanest draft experience, real-time injury alerts, and seamless league management.',
    url: 'https://sleeper.com',
    categories: ['Roster Mgmt', 'News'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Underdog Fantasy',
    description: 'Best Ball drafts and pick\'em contests. No in-season management required — just draft and win.',
    url: 'https://underdogfantasy.com',
    categories: ['Roster Mgmt'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'DraftKings',
    description: 'The biggest DFS platform for NFL. Guaranteed prize pools every week with contests starting at $0.25.',
    url: 'https://www.draftkings.com',
    categories: ['DFS'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'FanDuel',
    description: 'Head-to-head and tournament DFS on FanDuel. Known for the largest single-game slates and easy-to-use interface.',
    url: 'https://www.fanduel.com',
    categories: ['DFS'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Dynasty Daddy Trade Calculator',
    description: 'Dynasty-specific trade calculator with historical trade volume data. Great for superflex and devy leagues.',
    url: 'https://dynastydaddy.com/trade-calculator',
    categories: ['Trade Analysis', 'Dynasty'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'KeepTradeCut',
    description: 'Vote on dynasty values and see community consensus rankings in real time. The most active dynasty community tool.',
    url: 'https://keeptradecut.com',
    categories: ['Dynasty', 'Rankings'],
    priceType: 'free',
    featured: false,
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Flock Fantasy',
    description: 'Premium fantasy football analysis, rankings, and tools from the Flock Fantasy team. Podcast, YouTube content, and paid picks.',
    url: 'https://flockfantasy.com',
    categories: ['Rankings', 'News'],
    priceType: 'freemium',
    price: null,
    featured: false,
    isActive: true,
    sortOrder: 9,
  },
  {
    name: 'PFF Fantasy Tools',
    description: 'Premium analytics suite with lineup optimizer, ownership projections, and advanced player grades from Pro Football Focus.',
    url: 'https://www.pff.com/fantasy/tools',
    categories: ['DFS', 'Projections', 'Rankings'],
    priceType: 'paid',
    price: '$9.99/mo',
    featured: false,
    isActive: true,
    sortOrder: 10,
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding directory data...\n')

  console.log('Ranking sites:')
  for (const site of RANKING_SITES) {
    const existing = await db.rankingSite.findFirst({ where: { name: site.name, url: site.url } })
    if (existing) {
      await db.rankingSite.update({ where: { id: existing.id }, data: site })
      console.log(`  ~ Updated: ${site.name}`)
    } else {
      await db.rankingSite.create({ data: site })
      console.log(`  + Created: ${site.name}`)
    }
  }

  console.log('\nFantasy tools:')
  for (const tool of FANTASY_TOOLS) {
    const existing = await db.fantasyTool.findFirst({ where: { name: tool.name, url: tool.url } })
    if (existing) {
      await db.fantasyTool.update({ where: { id: existing.id }, data: tool })
      console.log(`  ~ Updated: ${tool.name}`)
    } else {
      await db.fantasyTool.create({ data: tool })
      console.log(`  + Created: ${tool.name}`)
    }
  }

  const [rankingCount, toolCount] = await Promise.all([
    db.rankingSite.count(),
    db.fantasyTool.count(),
  ])
  console.log(`\nDone — ${rankingCount} ranking sites, ${toolCount} tools in DB.`)
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
