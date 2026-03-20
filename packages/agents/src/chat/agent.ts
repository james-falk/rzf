import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'
import { z } from 'zod'

const agentContext = loadAgentContext(import.meta.url)

// ─── Output Schema ────────────────────────────────────────────────────────────

const ChatOutputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('answer'),
    reply: z.string(),
    followUpSuggestions: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('route'),
    route: z.string(),
    reason: z.string(),
    reply: z.string(),
    extractedParams: z.record(z.string()).optional(),
  }),
])

export type ChatOutput = z.infer<typeof ChatOutputSchema>

export interface ChatInput {
  userId: string
  message: string
  leagueId?: string
  sessionId?: string
  reportContext?: {
    agentType: string
    runId: string
  }
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function runChatAgent(input: ChatInput): Promise<ChatOutput> {
  const { userId, message, leagueId, sessionId, reportContext } = input
  console.log(`[chat-agent] message="${message.slice(0, 80)}" leagueId=${leagueId ?? 'none'} reportContext=${reportContext?.agentType ?? 'none'}`)

  // Tools available to the chat agent
  const tools = {
    league_roster: async (): Promise<string> => {
      if (!leagueId) return 'No league selected.'

      const profile = await db.sleeperProfile.findUnique({
        where: { userId },
        select: { sleeperId: true },
      })
      if (!profile) return 'No Sleeper account connected.'

      const roster = await SleeperConnector.getUserRoster(leagueId, profile.sleeperId)
      if (!roster?.players?.length) return 'No roster players found.'

      const players = await db.player.findMany({
        where: { sleeperId: { in: roster.players } },
        select: {
          sleeperId: true,
          firstName: true,
          lastName: true,
          position: true,
          team: true,
          injuryStatus: true,
        },
      })

      const lines = players.map(
        (p) =>
          `${p.firstName} ${p.lastName} (${p.position ?? '?'}, ${p.team ?? 'FA'})${p.injuryStatus ? ` — ${p.injuryStatus}` : ''}`,
      )
      return `Current Roster:\n${lines.join('\n')}`
    },

    league_info: async (): Promise<string> => {
      if (!leagueId) return 'No league selected.'
      try {
        const league = await SleeperConnector.getLeague(leagueId)
        const scoringType =
          league.scoring_settings['rec'] === 1
            ? 'PPR'
            : league.scoring_settings['rec'] === 0.5
              ? 'Half-PPR'
              : 'Standard'
        const leagueTypeNum = Number(league.settings['type'] ?? 0)
        const leagueType =
          leagueTypeNum === 2 ? 'Dynasty' : leagueTypeNum === 1 ? 'Keeper' : 'Redraft'
        return `League: ${league.name} | Format: ${scoringType} | Type: ${leagueType} | Slots: ${league.roster_positions.join(', ')}`
      } catch {
        return 'Could not load league info.'
      }
    },

    player_lookup: async (): Promise<string> => {
      // Split message into candidate word sequences (bigrams + single words)
      // to handle "DJ Moore", "AJ Brown", multi-word names, and lowercase mentions
      const words = message
        .replace(/[^\w\s'-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2)

      const candidates = new Set<string>()
      for (let i = 0; i < words.length; i++) {
        const w0 = words[i]
        const w1 = words[i + 1]
        const w2 = words[i + 2]
        if (!w0) continue
        candidates.add(w0)
        if (w1) candidates.add(`${w0} ${w1}`)
        if (w1 && w2) candidates.add(`${w0} ${w1} ${w2}`)
      }

      const STOP = new Set([
        'the', 'who', 'what', 'when', 'where', 'should', 'would', 'could', 'does',
        'will', 'his', 'her', 'him', 'are', 'was', 'how', 'can', 'did', 'has',
        'any', 'but', 'and', 'for', 'this', 'that', 'with', 'from', 'just',
        'scout', 'trade', 'add', 'drop', 'start', 'sit', 'pick', 'help', 'my',
        'team', 'player', 'week', 'score', 'point', 'rank', 'value', 'good', 'bad',
      ])
      const searchTerms = Array.from(candidates)
        .filter((c) => !STOP.has(c.toLowerCase()))
        .slice(0, 6)

      if (searchTerms.length === 0) return 'Could not identify a player name in the query.'

      const players = await db.player.findMany({
        where: {
          OR: searchTerms.flatMap((term) => [
            { lastName: { contains: term, mode: 'insensitive' } },
            { firstName: { contains: term, mode: 'insensitive' } },
          ]),
          position: { in: ['QB', 'RB', 'WR', 'TE', 'K'] },
          team: { not: null },
        },
        take: 4,
      })

      if (players.length === 0) {
        return `Could not find a player matching "${searchTerms.join(', ')}" in the database.`
      }

      const results: string[] = []
      for (const player of players.slice(0, 3)) {
        const valuesMap = await getMultiMarketValues([player.sleeperId])
        const values = valuesMap.get(player.sleeperId)
        const lines = [
          `${player.firstName} ${player.lastName} (${player.position ?? 'N/A'}, ${player.team ?? 'FA'}) [sleeperId:${player.sleeperId}]`,
          `Status: ${player.injuryStatus ?? 'Healthy'}`,
        ]
        if (values) {
          lines.push(
            formatMarketValuesForPrompt(`${player.firstName} ${player.lastName}`, values, 'dynasty'),
          )
        }
        results.push(lines.join('\n'))
      }
      return results.join('\n\n')
    },

    free_agents: async (): Promise<string> => {
      try {
        const trending = await SleeperConnector.getTrending('add', 48, 15)
        if (trending.length === 0) return 'No trending waiver adds found in the last 48 hours.'

        const playerIds = trending.map((t) => t.player_id)
        const players = await db.player.findMany({
          where: { sleeperId: { in: playerIds } },
          select: {
            sleeperId: true,
            firstName: true,
            lastName: true,
            position: true,
            team: true,
            injuryStatus: true,
          },
        })

        const sorted = trending
          .map((t) => players.find((p) => p.sleeperId === t.player_id))
          .filter((p): p is NonNullable<typeof p> => p != null)
          .slice(0, 10)

        return `Trending waiver adds (last 48h):\n${sorted
          .map(
            (p) =>
              `${p.firstName} ${p.lastName} (${p.position ?? '?'}, ${p.team ?? 'FA'})${p.injuryStatus ? ` — ${p.injuryStatus}` : ''}`,
          )
          .join('\n')}`
      } catch {
        return 'Could not load trending waiver adds.'
      }
    },

    standings: async (): Promise<string> => {
      if (!leagueId) return 'No league selected.'
      try {
        const rosters = await SleeperConnector.getRosters(leagueId)
        if (!rosters.length) return 'Could not load standings.'

        const sorted = [...rosters].sort((a, b) => {
          const wDiff = (b.settings.wins ?? 0) - (a.settings.wins ?? 0)
          return wDiff !== 0 ? wDiff : (b.settings.fpts ?? 0) - (a.settings.fpts ?? 0)
        })

        const profile = await db.sleeperProfile.findUnique({
          where: { userId },
          select: { sleeperId: true },
        })

        const lines = sorted.slice(0, 8).map((r, i) => {
          const isUser = profile && r.owner_id === profile.sleeperId
          const w = r.settings.wins ?? 0
          const l = r.settings.losses ?? 0
          const pts = ((r.settings.fpts ?? 0) + (r.settings.fpts_decimal ?? 0) / 100).toFixed(1)
          return `${i + 1}. ${isUser ? '[YOU] ' : ''}${w}W-${l}L (${pts} pts)`
        })
        return `League Standings:\n${lines.join('\n')}`
      } catch {
        return 'Could not load standings.'
      }
    },

    recent_news: async (): Promise<string> => {
      // Try to find player IDs mentioned from the roster if we have a league
      if (!leagueId) return 'No league context for news lookup.'

      const profile = await db.sleeperProfile.findUnique({
        where: { userId },
        select: { sleeperId: true },
      })
      if (!profile) return 'No Sleeper account connected.'

      const roster = await SleeperConnector.getUserRoster(leagueId, profile.sleeperId)
      if (!roster?.players?.length) return 'No roster to fetch news for.'

      const injection = await injectContent(roster.players.slice(0, 6), {
        agentType: 'player_scout',
        recencyWindowHours: 48,
        maxItemsTotal: 8,
        allowedTiers: [1, 2],
        allowedPlatforms: ['rss'],
      })

      if (injection.items.length === 0) return 'No recent news available.'
      return injection.items.map((item) => `[${item.sourceName}] ${item.title}`).join('\n')
    },

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, sessionId)
      return ctx || 'No prior session context.'
    },
  }

  const lowerMsg = message.toLowerCase()
  const wantsStandings = /standing|record|rank|place|first|last|win|loss/.test(lowerMsg)
  const wantsWaivers = /waiver|free agent|available|pickup|add|trending/.test(lowerMsg)

  const extraContextParts: string[] = [`User message: "${message}"`]
  if (reportContext) {
    extraContextParts.push(
      `[Prior Report Context] The user just completed a ${reportContext.agentType} report (runId: ${reportContext.runId}). ` +
      `If they are asking to modify that analysis (e.g., add/swap a player in a trade, ask a follow-up about that specific report) ` +
      `consider that context. If they are asking about a new topic or a different player, route to the appropriate specialist agent.`,
    )
  }

  const { output } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: leagueId
      ? [
          'session_history',
          'league_info',
          'league_roster',
          ...(wantsStandings ? ['standings'] : []),
          ...(wantsWaivers ? ['free_agents'] : []),
        ]
      : ['session_history'],
    outputValidator: (raw) => ChatOutputSchema.parse(raw),
    extraContext: extraContextParts.join('\n\n'),
    model: 'haiku',
    maxOutputTokens: 1500,
    maxIterations: 3,
  })

  console.log(`[chat-agent] type=${output.type}`)
  return output
}
