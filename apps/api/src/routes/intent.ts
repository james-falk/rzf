import type { FastifyInstance } from 'fastify'
import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
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
  {
    type: 'player_compare',
    label: 'Player Comparison',
    description: 'Side-by-side comparison of 2–4 players with a clear winner and reasoning',
    available: true,
    requiredParams: ['playerIds'],
  },
]

// Meta-keywords: user is asking what the assistant can do — show all agent chips
const META_KEYWORDS = [
  'what can you do', 'what are my options', 'show agents', 'agent options',
  'new agent', 'run an agent', 'what agents', 'options', 'help', 'menu',
  'what do you do', 'capabilities', 'features', 'show me what',
]

const AGENT_KEYWORDS: Record<string, string[]> = {
  team_eval: ['team', 'roster', 'grade', 'analyze', 'analysis', 'evaluation', 'breakdown', 'squad', 'how is', 'check', 'overall'],
  injury_watch: ['injury', 'injured', 'hurt', 'questionable', 'doubtful', 'out', 'status', 'health', 'risk', 'handcuff'],
  waiver: ['waiver', 'add', 'drop', 'pickup', 'wire', 'available', 'free agent', 'streaming'],
  lineup: ['start', 'sit', 'lineup', 'bench', 'flex', 'who should i start', 'starter', 'optimize'],
  trade_analysis: ['trade', 'swap', 'offer', 'exchange', 'worth', 'value', 'should i trade'],
  player_scout: ['scout', 'player', 'scouting', 'report', 'outlook', 'buy', 'sell', 'target', 'deep dive'],
  player_compare: ['compare', 'vs', 'versus', 'better', 'who should i pick up', 'who is better', 'comparison', 'head to head', 'side by side'],
}

function keywordClassify(message: string, registry: AgentMeta[]): { agent: AgentMeta | null; score: number } {
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

  return { agent: bestMatch, score: bestScore }
}

interface LLMIntentResult {
  agentType: string | null
  extractedPlayerNames: string[]
  focusNote: string | null
  confidence: number
}

async function llmClassifyIntent(message: string, registry: AgentMeta[]): Promise<LLMIntentResult> {
  const agentList = registry.map((a) => `${a.type}: ${a.description}`).join('\n')
  const systemPrompt = `You are a fantasy football assistant intent classifier. Given a user message, determine which agent to run, extract any player names mentioned, and extract any specific focus or context the user wants the report to address.

Available agents:
${agentList}

Respond with JSON only:
{
  "agentType": "one of the agent type strings above, or null if unclear",
  "extractedPlayerNames": ["array of player names mentioned in the message"],
  "focusNote": "any specific focus, perspective, or context mentioned (e.g. 'dynasty perspective', '3-year outlook', 'PPR leagues') or null",
  "confidence": 0.0-1.0
}`
  const userPrompt = `User message: "${message}"`

  try {
    const { data } = await LLMConnector.completeJSON(
      { systemPrompt, userPrompt, model: 'haiku' },
      (raw) => raw as LLMIntentResult,
    )
    return data
  } catch {
    return { agentType: null, extractedPlayerNames: [], focusNote: null, confidence: 0 }
  }
}

async function fuzzyResolvePlayer(name: string): Promise<{ playerId: string; playerName: string; confidence: number } | null> {
  try {
    const results = await db.player.findMany({
      where: {
        OR: [
          { firstName: { contains: name.split(' ')[0] ?? '', mode: 'insensitive' } },
          { lastName: { contains: name.split(' ').slice(-1)[0] ?? '', mode: 'insensitive' } },
        ],
        status: { not: 'Inactive' },
      },
      take: 5,
      select: { sleeperId: true, firstName: true, lastName: true, position: true, team: true },
    })

    if (results.length === 0) return null

    const lower = name.toLowerCase()
    const exact = results.find(
      (p) => `${p.firstName} ${p.lastName}`.toLowerCase() === lower,
    )
    if (exact) {
      return { playerId: exact.sleeperId, playerName: `${exact.firstName} ${exact.lastName}`, confidence: 1.0 }
    }

    // Return best partial match with lower confidence
    const best = results[0]!
    return { playerId: best.sleeperId, playerName: `${best.firstName} ${best.lastName}`, confidence: 0.6 }
  } catch {
    return null
  }
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

    // ── Stage 0: meta-intent fast-path ────────────────────────────────────────
    // If the user is asking what the assistant can do, return null agent + chips.
    const lower0 = message.toLowerCase()
    if (META_KEYWORDS.some((kw) => lower0.includes(kw))) {
      return reply.send({
        agentType: null,
        agentMeta: null,
        gatheredParams: {},
        missingParams: [],
        clarifyingQuestion: "Here's what I can do for you — pick an option to get started:",
        readyToRun: false,
        availableAgents: liveRegistry,
        extractedPlayers: [],
        needsClarification: false,
      } satisfies ManagerIntentOutput)
    }

    // ── Stage 1: keyword fast-path ─────────────────────────────────────────────
    const { agent: keywordAgent, score: keywordScore } = keywordClassify(message, liveRegistry)

    // ── Stage 2: LLM fallback for ambiguous or player-heavy messages ───────────
    let agent: AgentMeta | null = keywordAgent
    let extractedPlayers: Array<{ name: string; playerId?: string; confidence: number }> = []
    let needsClarification = false
    let extractedFocusNote: string | null = null

    // Always run LLM to extract players + focusNote, even if keyword matched
    const llmResult = await llmClassifyIntent(message, liveRegistry)
    extractedFocusNote = llmResult.focusNote ?? null

    if (keywordScore === 0 && llmResult.agentType) {
      agent = liveRegistry.find((a) => a.type === llmResult.agentType) ?? null
    }

    // Resolve extracted player names against the DB
    if (llmResult.extractedPlayerNames.length > 0) {
      const resolved = await Promise.all(
        llmResult.extractedPlayerNames.slice(0, 4).map(async (name) => {
          const match = await fuzzyResolvePlayer(name)
          return match
            ? { name, playerId: match.playerId, confidence: match.confidence }
            : { name, confidence: 0 }
        }),
      )
      extractedPlayers = resolved

      // If any player was extracted with low confidence, flag for clarification
      const lowConfidence = resolved.some((p) => p.confidence > 0 && p.confidence < 0.8)
      if (lowConfidence) needsClarification = true
    }

    // ── Stage 3: Multi-player routing ─────────────────────────────────────────
    // If 2+ players were confidently resolved, route to player_compare
    const resolvedWithId = extractedPlayers.filter((p) => p.playerId && p.confidence >= 0.6)
    if (resolvedWithId.length >= 2) {
      const compareAgent = liveRegistry.find((a) => a.type === 'player_compare')
      if (compareAgent) {
        agent = compareAgent
        needsClarification = false
      }
    }

    // Unrecognized input — return null agent so the frontend shows all agent chips
    if (!agent) {
      return reply.send({
        agentType: null,
        agentMeta: null,
        gatheredParams: {},
        missingParams: [],
        clarifyingQuestion: "I'm not sure what you're looking for. Here's what I can help with:",
        readyToRun: false,
        availableAgents: liveRegistry,
        extractedPlayers: [],
        needsClarification: false,
        extractedFocusNote,
      } satisfies ManagerIntentOutput)
    }

    // Gather what we already have from context
    const gatheredParams: Record<string, string> = {}
    if (context?.leagueId) gatheredParams['leagueId'] = context.leagueId

    // Pre-populate player IDs for scout/compare from resolved players
    if (agent.type === 'player_compare' && resolvedWithId.length >= 2) {
      gatheredParams['playerIds'] = resolvedWithId.map((p) => p.playerId!).join(',')
    } else if (extractedPlayers.length > 0 && extractedPlayers[0]?.playerId) {
      gatheredParams['playerId'] = extractedPlayers[0].playerId
    }

    const missingParams = agent.requiredParams.filter((p) => !gatheredParams[p])

    // player_compare and player_scout can auto-run when players are already resolved
    const needsDedicatedPage = agent.type === 'trade_analysis'
    const dedicatedPageUrl = agent.type === 'trade_analysis' ? '/dashboard/trade' : null

    // Clarifying question: player disambiguation takes priority
    const disambigPlayer = extractedPlayers.find((p) => p.confidence > 0 && p.confidence < 0.8)
    const clarifyingQuestion = needsClarification && disambigPlayer
      ? `Did you mean ${disambigPlayer.name}?`
      : needsDedicatedPage
        ? `For ${agent.label}, I'll need a bit more detail.`
        : missingParams.includes('leagueId')
          ? 'Which league should I analyze?'
          : null

    const readyToRun = missingParams.length === 0 && !needsDedicatedPage && !needsClarification

    return reply.send({
      agentType: agent.type,
      agentMeta: agent,
      gatheredParams,
      missingParams,
      clarifyingQuestion,
      readyToRun,
      availableAgents: liveRegistry,
      ...(needsDedicatedPage && dedicatedPageUrl ? { redirectUrl: dedicatedPageUrl } : {}),
      extractedPlayers,
      needsClarification,
      extractedFocusNote,
    } satisfies ManagerIntentOutput)
  })

  // GET /agents/available — list all agents (for UI to show chips)
  app.get('/agents/available', { preHandler: requireAuth }, async (_req, reply) => {
    const liveRegistry = await getLiveRegistry()
    return reply.send({ agents: liveRegistry })
  })
}
