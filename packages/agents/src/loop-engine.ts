import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { LLMConnector } from '@rzf/connectors/llm'

// ─── Public Types ─────────────────────────────────────────────────────────────

/**
 * A registry of named data-fetching functions available to an agent during its loop.
 * Each tool returns a formatted string that gets appended to the assembled context.
 */
export type ToolRegistry = Record<string, () => Promise<string>>

/**
 * Options passed to runAgentLoop per invocation.
 */
export interface LoopRunOptions<T> {
  /** Pre-loaded CONTEXT.md content for this agent. Load with loadAgentContext(). */
  context: string
  /** All available data tools for this agent (keyed by tool name matching CONTEXT.md). */
  tools: ToolRegistry
  /** Tool names to call on the first iteration — the minimum viable data set. */
  initialTools: string[]
  /** Parses and validates the final LLM JSON output into the agent's output type. */
  outputValidator: (raw: unknown) => T
  /** Optional extra context appended after assembled tool data (user prefs, session history, focusNote). */
  extraContext?: string
  /** Override the confidence threshold parsed from CONTEXT.md. */
  confidenceThreshold?: number
  /** Override the max iterations parsed from CONTEXT.md. */
  maxIterations?: number
  /** Model for the final output call (default: haiku). Eval calls always use haiku. */
  model?: 'haiku' | 'sonnet'
  /** Max output tokens for the final call (default: 1500). */
  maxOutputTokens?: number
}

/**
 * Metadata returned alongside the agent output.
 */
export interface AgentLoopMetadata {
  /** Number of evaluation iterations performed before final output. */
  iterations: number
  /** Confidence score (0–100) at the time of final output. */
  finalConfidence: number
  /** Names of all tools that were fetched during the loop. */
  toolsUsed: string[]
  /** Total tokens consumed across all LLM calls (eval + output). */
  tokensUsed: number
}

// ─── Context Loader ───────────────────────────────────────────────────────────

/**
 * Loads CONTEXT.md for an agent.
 *
 * Usage in each agent.ts:
 *   const agentContext = loadAgentContext(import.meta.url)
 *
 * Searches two locations in order:
 *   1. Same directory as the calling module (works in both src/ and dist/ once files are copied)
 *   2. The src/ counterpart when running from dist/ (fallback)
 */
export function loadAgentContext(callerImportMetaUrl: string): string {
  const callerDir = dirname(fileURLToPath(callerImportMetaUrl))
  const agentDirName = callerDir.split(/[/\\]/).pop() ?? ''

  const candidates = [
    join(callerDir, 'CONTEXT.md'),
    // When running from dist/, resolve back to src/
    join(callerDir, '..', '..', 'src', agentDirName, 'CONTEXT.md'),
  ]

  for (const path of candidates) {
    try {
      return readFileSync(path, 'utf-8')
    } catch {
      // try next
    }
  }

  throw new Error(
    `Cannot find CONTEXT.md for agent "${agentDirName}". Searched:\n${candidates.join('\n')}`,
  )
}

// ─── Loop Engine ──────────────────────────────────────────────────────────────

interface EvalResponse {
  confidence: number
  missingTools: string[]
  reasoning: string
}

/**
 * Runs an agent in an iterative loop:
 *
 * 1. Fetch initial tools
 * 2. Ask LLM to evaluate confidence and identify missing data
 * 3. If confidence < threshold: fetch missing tools, repeat
 * 4. If confidence >= threshold OR max iterations reached: produce final output
 * 5. Return output + metadata
 *
 * All agents should use this instead of a single LLM call.
 */
export async function runAgentLoop<T>(
  options: LoopRunOptions<T>,
): Promise<{ output: T; metadata: AgentLoopMetadata }> {
  const {
    context,
    tools,
    initialTools,
    outputValidator,
    extraContext,
    model = 'haiku',
    maxOutputTokens = 1500,
  } = options

  // Parse thresholds from CONTEXT.md — these take precedence over option defaults
  const threshold = parseConfidenceThreshold(context) ?? options.confidenceThreshold ?? 70
  const maxIter = parseMaxIterations(context) ?? options.maxIterations ?? 3

  const toolsUsed: string[] = []
  const assembledData: string[] = []
  let totalTokens = 0
  let iterations = 0
  let finalConfidence = 0
  let pendingTools = [...new Set(initialTools)]

  for (let i = 0; i < maxIter; i++) {
    iterations = i + 1

    // Fetch any pending tools (skip already-fetched ones)
    for (const toolName of pendingTools) {
      if (toolsUsed.includes(toolName)) continue
      const fn = tools[toolName]
      if (!fn) {
        assembledData.push(`[${toolName}]\nTool not available.`)
        toolsUsed.push(toolName)
        continue
      }
      try {
        const data = await fn()
        assembledData.push(`[${toolName}]\n${data}`)
        toolsUsed.push(toolName)
      } catch (err) {
        assembledData.push(`[${toolName}]\nFetch error: ${String(err)}`)
        toolsUsed.push(toolName)
      }
    }
    pendingTools = []

    const dataBlock = assembledData.join('\n\n')
    const userPrompt = extraContext ? `${dataBlock}\n\n${extraContext}` : dataBlock

    // ── Evaluation call (always haiku, small output) ──────────────────────────
    const evalSystem = buildEvalSystemPrompt(context)
    const evalResult = await LLMConnector.complete({
      systemPrompt: evalSystem,
      userPrompt: userPrompt || 'No data assembled yet.',
      model: 'haiku',
      maxTokens: 250,
    })
    totalTokens += evalResult.tokensUsed

    const evalResponse = parseEvalResponse(evalResult.content)
    finalConfidence = evalResponse.confidence

    console.log(
      `[loop-engine] iter=${iterations} confidence=${finalConfidence} missing=${evalResponse.missingTools.join(',')}`,
    )

    const isLastIter = i === maxIter - 1
    const hasNewTools = evalResponse.missingTools.some(
      (t) => tools[t] && !toolsUsed.includes(t),
    )

    if (finalConfidence >= threshold || isLastIter || !hasNewTools) {
      // ── Final output call ─────────────────────────────────────────────────
      const outputSystem = buildOutputSystemPrompt(context)
      const outputResult = await LLMConnector.completeJSON(
        { systemPrompt: outputSystem, userPrompt, model, maxTokens: maxOutputTokens },
        outputValidator,
      )
      totalTokens += outputResult.tokensUsed

      return {
        output: outputResult.data,
        metadata: { iterations, finalConfidence, toolsUsed, tokensUsed: totalTokens },
      }
    }

    // Queue missing tools for next iteration
    pendingTools = evalResponse.missingTools.filter(
      (t) => tools[t] && !toolsUsed.includes(t),
    )
  }

  // Should not reach here, but safety fallback
  const dataBlock = assembledData.join('\n\n')
  const userPrompt = extraContext ? `${dataBlock}\n\n${extraContext}` : dataBlock
  const outputSystem = buildOutputSystemPrompt(context)
  const outputResult = await LLMConnector.completeJSON(
    { systemPrompt: outputSystem, userPrompt, model, maxTokens: maxOutputTokens },
    outputValidator,
  )
  totalTokens += outputResult.tokensUsed

  return {
    output: outputResult.data,
    metadata: { iterations, finalConfidence, toolsUsed, tokensUsed: totalTokens },
  }
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildEvalSystemPrompt(context: string): string {
  return `${context}

---
EVALUATION TASK: Review the data assembled so far.

Score your confidence from 0–100 based on whether you have enough data to produce a high-quality, actionable output matching the ## Output Schema. Reference the ## Confidence Thresholds and ## Required data points in your context.

If confidence is below the threshold, identify which tools from ## Data Tools would most improve the analysis. Only list tools that are both available in your context AND not yet shown in the assembled data.

Respond with JSON only — no prose, no markdown:
{
  "confidence": <number 0-100>,
  "missingTools": ["toolName1"],
  "reasoning": "<one sentence: what you have and what is critically missing>"
}`
}

function buildOutputSystemPrompt(context: string): string {
  return `${context}

---
OUTPUT TASK: You have sufficient data. Produce the final structured output.

Follow your ## Output Schema exactly. Return JSON only — no markdown fences, no prose before or after.`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseEvalResponse(content: string): EvalResponse {
  try {
    const jsonStr = content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim()
    const raw = JSON.parse(jsonStr) as Record<string, unknown>
    return {
      confidence: typeof raw['confidence'] === 'number' ? raw['confidence'] : 0,
      missingTools: Array.isArray(raw['missingTools'])
        ? (raw['missingTools'] as string[]).filter((t) => typeof t === 'string')
        : [],
      reasoning: typeof raw['reasoning'] === 'string' ? raw['reasoning'] : '',
    }
  } catch {
    // If eval parse fails, treat as confident enough to proceed
    return { confidence: 99, missingTools: [], reasoning: 'eval parse failed — proceeding to output' }
  }
}

function parseConfidenceThreshold(context: string): number | null {
  const match = context.match(/Minimum confidence to return final output[^:]*:\s*(\d+)/)
  return match ? parseInt(match[1]!, 10) : null
}

function parseMaxIterations(context: string): number | null {
  const match = context.match(/Maximum loop iterations[^:]*:\s*(\d+)/)
  return match ? parseInt(match[1]!, 10) : null
}
