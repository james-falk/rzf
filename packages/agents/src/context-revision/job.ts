/**
 * Context Revision Job
 *
 * Reads accumulated low-rated agent runs, identifies patterns of failure,
 * and rewrites the "## Learned Preferences" section of each agent's CONTEXT.md.
 *
 * This is the feedback loop that makes agents self-improve over time.
 *
 * Trigger: Called periodically (e.g. nightly) or when a threshold of low-rated
 * runs accumulates for a given agent type.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Map agent type strings to their CONTEXT.md paths
const AGENT_CONTEXT_PATHS: Record<string, string> = {
  player_scout: join(__dirname, '..', 'player-scout', 'CONTEXT.md'),
  trade_analysis: join(__dirname, '..', 'trade-analysis', 'CONTEXT.md'),
  team_eval: join(__dirname, '..', 'team-eval', 'CONTEXT.md'),
  player_compare: join(__dirname, '..', 'player-compare', 'CONTEXT.md'),
  waiver: join(__dirname, '..', 'waiver', 'CONTEXT.md'),
  lineup: join(__dirname, '..', 'lineup', 'CONTEXT.md'),
  injury_watch: join(__dirname, '..', 'injury-watch', 'CONTEXT.md'),
}

// Minimum low-rated runs needed before revision is attempted
const MIN_LOW_RATED_RUNS = 3

export interface ContextRevisionResult {
  agentType: string
  revised: boolean
  reason: string
  lowRatedRunsFound: number
}

/**
 * Run context revision for all agents that have enough low-rated feedback.
 */
export async function runContextRevisionJob(): Promise<ContextRevisionResult[]> {
  const results: ContextRevisionResult[] = []

  for (const [agentType, contextPath] of Object.entries(AGENT_CONTEXT_PATHS)) {
    const result = await reviseAgentContext(agentType, contextPath)
    results.push(result)
  }

  return results
}

/**
 * Revise a single agent's CONTEXT.md based on recent low-rated runs.
 */
export async function reviseAgentContext(
  agentType: string,
  contextPath: string,
): Promise<ContextRevisionResult> {
  // Try src/ path if compiled dist/ path doesn't exist
  const resolvedPath = resolveContextPath(contextPath)
  if (!resolvedPath) {
    return { agentType, revised: false, reason: 'CONTEXT.md not found', lowRatedRunsFound: 0 }
  }

  // Fetch recent low-rated runs for this agent
  const lowRatedRuns = await db.agentRun.findMany({
    where: {
      agentType,
      rating: 'down',
      status: 'done',
      outputJson: { not: undefined },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      inputJson: true,
      outputJson: true,
      createdAt: true,
    },
  })

  if (lowRatedRuns.length < MIN_LOW_RATED_RUNS) {
    return {
      agentType,
      revised: false,
      reason: `Only ${lowRatedRuns.length}/${MIN_LOW_RATED_RUNS} low-rated runs — not enough to revise`,
      lowRatedRunsFound: lowRatedRuns.length,
    }
  }

  const currentContext = readFileSync(resolvedPath, 'utf-8')

  // Build a summary of the low-rated runs for Claude to analyze
  const runSummaries = lowRatedRuns.map((run, i) => {
    const output = run.outputJson as Record<string, unknown>
    return `Run ${i + 1} (${run.createdAt.toISOString().split('T')[0]}):\nOutput summary: ${JSON.stringify(output).slice(0, 400)}`
  })

  const systemPrompt = `You are an AI assistant helping to improve a fantasy football analysis agent by revising its context file.

You will be given:
1. The agent's current CONTEXT.md (specifically the ## Learned Preferences section)
2. A sample of runs that users rated negatively (thumbs down)

Your job is to analyze the patterns in the low-rated outputs and suggest TARGETED improvements to the ## Learned Preferences section only. Do not change any other sections.

Rules:
- Only modify the "## Learned Preferences" section
- Add, modify, or remove preference bullets based on the failure patterns
- Keep preferences specific and actionable
- Do not exceed 8 preference bullets total
- Return the COMPLETE updated ## Learned Preferences section only (starting with "## Learned Preferences")
- No other text, no explanation, no markdown fences`

  const userPrompt = `Current CONTEXT.md:
${currentContext}

---
Recent low-rated runs (${lowRatedRuns.length} total):
${runSummaries.join('\n\n')}

---
Analyze these low-rated outputs and identify what patterns led to user dissatisfaction.
Return the updated ## Learned Preferences section with targeted improvements.`

  let revisedSection: string
  try {
    const result = await LLMConnector.complete({
      systemPrompt,
      userPrompt,
      model: 'sonnet',
      maxTokens: 600,
    })
    revisedSection = result.content.trim()
  } catch (err) {
    return {
      agentType,
      revised: false,
      reason: `LLM call failed: ${String(err)}`,
      lowRatedRunsFound: lowRatedRuns.length,
    }
  }

  // Validate that the response looks like a Learned Preferences section
  if (!revisedSection.includes('## Learned Preferences')) {
    return {
      agentType,
      revised: false,
      reason: 'LLM response did not contain a valid ## Learned Preferences section',
      lowRatedRunsFound: lowRatedRuns.length,
    }
  }

  // Replace the existing Learned Preferences section in the full context
  const updatedContext = replaceLearnedPreferences(currentContext, revisedSection)

  writeFileSync(resolvedPath, updatedContext, 'utf-8')

  console.log(
    `[context-revision] Revised ${agentType} CONTEXT.md based on ${lowRatedRuns.length} low-rated runs`,
  )

  return {
    agentType,
    revised: true,
    reason: `Revised based on ${lowRatedRuns.length} low-rated runs`,
    lowRatedRunsFound: lowRatedRuns.length,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveContextPath(primaryPath: string): string | null {
  if (existsSync(primaryPath)) return primaryPath

  // Fallback: if running from dist/, check src/ counterpart
  const srcPath = primaryPath.replace(/[/\\]dist[/\\]/, '/src/')
  if (existsSync(srcPath)) return srcPath

  return null
}

function replaceLearnedPreferences(fullContext: string, newSection: string): string {
  // Match from "## Learned Preferences" to the next "##" heading or end of file
  const pattern = /## Learned Preferences[\s\S]*?(?=\n## |\s*$)/
  const match = fullContext.match(pattern)

  if (!match) {
    // Section not found — append it
    return `${fullContext.trim()}\n\n${newSection}\n`
  }

  return fullContext.replace(pattern, newSection)
}
