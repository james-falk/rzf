import type { FastifyInstance } from 'fastify'
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
    type: 'waiver_wire',
    label: 'Waiver Wire',
    description: 'Best available adds and drops tailored to your roster gaps',
    available: false,
    requiredParams: ['leagueId'],
  },
  {
    type: 'trade_analysis',
    label: 'Trade Advice',
    description: 'Accept or reject trade offers with detailed reasoning and counter-suggestions',
    available: false,
    requiredParams: ['leagueId', 'givePlayers', 'receivePlayers'],
  },
  {
    type: 'start_sit',
    label: 'Start / Sit',
    description: 'Confident start/sit recommendations for borderline lineup decisions',
    available: false,
    requiredParams: ['leagueId'],
  },
]

const AGENT_KEYWORDS: Record<string, string[]> = {
  team_eval: ['team', 'roster', 'grade', 'analyze', 'analysis', 'evaluation', 'breakdown', 'squad', 'how is', 'check', 'overall'],
  waiver_wire: ['waiver', 'add', 'drop', 'pickup', 'wire', 'available', 'free agent', 'streaming'],
  trade_analysis: ['trade', 'swap', 'offer', 'exchange', 'worth', 'value', 'should i trade'],
  start_sit: ['start', 'sit', 'lineup', 'bench', 'flex', 'who should i start', 'starter'],
}

function classifyIntent(message: string): AgentMeta | null {
  const lower = message.toLowerCase()
  let bestMatch: AgentMeta | null = null
  let bestScore = 0

  for (const agent of AGENT_REGISTRY) {
    const keywords = AGENT_KEYWORDS[agent.type] ?? []
    const score = keywords.filter((kw) => lower.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = agent
    }
  }

  // Default to team_eval if message is short and unclassified (general query)
  if (!bestMatch && message.trim().length > 0) {
    bestMatch = AGENT_REGISTRY.find((a) => a.type === 'team_eval') ?? null
  }

  return bestMatch
}

export async function intentRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/intent — classify user intent and return required params
  app.post('/agents/intent', { preHandler: requireAuth }, async (req, reply) => {
    const body = ManagerIntentInputSchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { message, context } = body.data
    const agent = classifyIntent(message)

    if (!agent) {
      return reply.send({
        agentType: null,
        agentMeta: null,
        gatheredParams: {},
        missingParams: [],
        clarifyingQuestion: "I didn't quite catch that. Try asking about your team, waiver wire, or a trade.",
        readyToRun: false,
        availableAgents: AGENT_REGISTRY,
      } satisfies ManagerIntentOutput)
    }

    if (!agent.available) {
      return reply.send({
        agentType: agent.type,
        agentMeta: agent,
        gatheredParams: {},
        missingParams: agent.requiredParams,
        clarifyingQuestion: `${agent.label} is coming soon! For now, I can run a full Team Analysis.`,
        readyToRun: false,
        availableAgents: AGENT_REGISTRY,
      } satisfies ManagerIntentOutput)
    }

    // Gather what we already have from context
    const gatheredParams: Record<string, string> = {}
    if (context?.leagueId) gatheredParams['leagueId'] = context.leagueId

    const missingParams = agent.requiredParams.filter((p) => !gatheredParams[p])

    const clarifyingQuestion = missingParams.includes('leagueId')
      ? 'Which league should I analyze?'
      : missingParams.includes('givePlayers')
        ? 'Which players are you giving away in this trade?'
        : null

    return reply.send({
      agentType: agent.type,
      agentMeta: agent,
      gatheredParams,
      missingParams,
      clarifyingQuestion,
      readyToRun: missingParams.length === 0,
      availableAgents: AGENT_REGISTRY,
    } satisfies ManagerIntentOutput)
  })

  // GET /agents/available — list all agents (for UI to show chips)
  app.get('/agents/available', { preHandler: requireAuth }, async (_req, reply) => {
    return reply.send({ agents: AGENT_REGISTRY })
  })
}
