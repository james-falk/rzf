import type { FastifyInstance } from 'fastify'
import { db } from '@rzf/db'
import { ManagerIntentInputSchema } from '@rzf/shared/types'
import type { AgentMeta, ManagerIntentOutput } from '@rzf/shared/types'
import { requireAuth } from '../middleware/auth.js'

// ── Agent registry — add new agents here as they're built ────────────────────
const AGENT_REGISTRY: AgentMeta[] = [
  {
    type: 'team_eval',
    label: 'Team Analysis',
    description: 'Full roster grade with position scores, strengths, weaknesses, and key insights',
    available: true,
    requiredParams: ['leagueId'],
  },
  {
    type: 'injury_watch',
    label: 'Injury Watch',
    description: 'Scan your starting lineup for injury risk and get handcuff recommendations',
    available: true,
    requiredParams: ['leagueId'],
  },
  {
    type: 'waiver',
    label: 'Waiver Wire',
    description: 'Best available adds and drops tailored to your roster gaps',
    available: true,
    requiredParams: ['leagueId'],
  },
  {
    type: 'lineup',
    label: 'Start / Sit',
    description: 'Optimized starting lineup with confidence scores and matchup analysis',
    available: true,
    requiredParams: ['leagueId'],
  },
  {
    type: 'trade_analysis',
    label: 'Trade Advice',
    description: 'Accept or reject trade offers with detailed reasoning and counter-suggestions',
    available: true,
    requiredParams: ['leagueId', 'giving', 'receiving'],
  },
  {
    type: 'player_scout',
    label: 'Player Scout',
    description: 'Deep-dive scouting report on any player — trend, outlook, buy/sell signals',
    available: true,
    requiredParams: ['playerId'],
  },
]

const AGENT_KEYWORDS: Record<string, string[]> = {
  team_eval: ['team', 'roster', 'grade', 'analyze', 'analysis', 'evaluation', 'breakdown', 'squad', 'how is', 'check', 'overall'],
  injury_watch: ['injury', 'injured', 'hurt', 'questionable', 'doubtful', 'out', 'status', 'health', 'risk', 'handcuff'],
  waiver: ['waiver', 'add', 'drop', 'pickup', 'wire', 'available', 'free agent', 'streaming'],
  lineup: ['start', 'sit', 'lineup', 'bench', 'flex', 'who should i start', 'starter', 'optimize'],
  trade_analysis: ['trade', 'swap', 'offer', 'exchange', 'worth', 'value', 'should i trade'],
  player_scout: ['scout', 'player', 'scouting', 'report', 'outlook', 'buy', 'sell', 'target', 'deep dive'],
}

function classifyIntentFromRegistry(message: string, registry: AgentMeta[]): AgentMeta | null {
  const lower = message.toLowerCase()
  let bestMatch: AgentMeta | null = null
  let bestScore = 0

  for (const agent of registry) {
    const keywords = AGENT_KEYWORDS[agent.type] ?? []
    const score = keywords.filter((kw) => lower.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = agent
    }
  }

  // Default to team_eval if message is short and unclassified (general query)
  if (!bestMatch && message.trim().length > 0) {
    bestMatch = registry.find((a) => a.type === 'team_eval') ?? null
  }

  return bestMatch
}

// Build a live registry from the DB, falling back to the hardcoded AGENT_REGISTRY
async function getLiveRegistry(): Promise<AgentMeta[]> {
  try {
    const configs = await db.agentConfig.findMany({ orderBy: { sortOrder: 'asc' } })
    if (configs.length === 0) return AGENT_REGISTRY
    return AGENT_REGISTRY.map((agent) => {
      const config = configs.find((c) => c.agentType === agent.type)
      if (!config) return agent
      return {
        ...agent,
        label: config.label,
        description: config.description,
        available: config.enabled,
      }
    })
  } catch {
    return AGENT_REGISTRY
  }
}

export async function intentRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/intent — classify user intent and return required params
  app.post('/agents/intent', { preHandler: requireAuth }, async (req, reply) => {
    const body = ManagerIntentInputSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { message, context } = body.data
    const liveRegistry = await getLiveRegistry()
    const agent = classifyIntentFromRegistry(message, liveRegistry)

    if (!agent) {
      return reply.send({
        agentType: null,
        agentMeta: null,
        gatheredParams: {},
        missingParams: [],
        clarifyingQuestion: "I didn't quite catch that. Try asking about your team, waiver wire, or a trade.",
        readyToRun: false,
        availableAgents: liveRegistry,
      } satisfies ManagerIntentOutput)
    }

    // Gather what we already have from context
    const gatheredParams: Record<string, string> = {}
    if (context?.leagueId) gatheredParams['leagueId'] = context.leagueId

    const missingParams = agent.requiredParams.filter((p) => !gatheredParams[p])

    // trade_analysis and player_scout need a dedicated page for complex input collection
    const needsDedicatedPage = agent.type === 'trade_analysis' || agent.type === 'player_scout'
    const dedicatedPageUrl = agent.type === 'trade_analysis' ? '/dashboard/trade' : '/dashboard/scout'

    const clarifyingQuestion = needsDedicatedPage
      ? `For ${agent.label}, I'll need a bit more detail. Head to the dedicated page to get started.`
      : missingParams.includes('leagueId')
        ? 'Which league should I analyze?'
        : null

    return reply.send({
      agentType: agent.type,
      agentMeta: agent,
      gatheredParams,
      missingParams,
      clarifyingQuestion,
      readyToRun: missingParams.length === 0 && !needsDedicatedPage,
      availableAgents: liveRegistry,
      ...(needsDedicatedPage ? { redirectUrl: dedicatedPageUrl } : {}),
    } satisfies ManagerIntentOutput)
  })

  // GET /agents/available — list all agents (for UI to show chips)
  app.get('/agents/available', { preHandler: requireAuth }, async (_req, reply) => {
    const liveRegistry = await getLiveRegistry()
    return reply.send({ agents: liveRegistry })
  })
}
