/**
 * Context Revision Job — Human-in-the-Loop Learning Pipeline
 *
 * Stage 1 (Detection): LearningSignal rows are written by:
 *   - agent.worker.ts (confidenceScore < 60 → low_confidence signal)
 *   - chat.ts route (chat failure patterns → chat_failure signal)
 *   - /internal/agents/train-example endpoint (manual signal)
 *
 * Stage 2 (Proposal): When 3+ unprocessed signals share the same agentType+signalType,
 *   this job generates a LearningProposal via Claude Sonnet for admin review.
 *
 * Stage 3 (Approval): Admin reviews proposals in /admin/learning, edits the AI draft,
 *   and approves. On approval, applyProposal() saves a version snapshot and patches
 *   the CONTEXT.md on disk.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'

const __dirname = dirname(fileURLToPath(import.meta.url))

const AGENT_CONTEXT_PATHS: Record<string, string> = {
  chat: join(__dirname, '..', 'chat', 'CONTEXT.md'),
  player_scout: join(__dirname, '..', 'player-scout', 'CONTEXT.md'),
  trade_analysis: join(__dirname, '..', 'trade-analysis', 'CONTEXT.md'),
  team_eval: join(__dirname, '..', 'team-eval', 'CONTEXT.md'),
  player_compare: join(__dirname, '..', 'player-compare', 'CONTEXT.md'),
  waiver: join(__dirname, '..', 'waiver', 'CONTEXT.md'),
  lineup: join(__dirname, '..', 'lineup', 'CONTEXT.md'),
  injury_watch: join(__dirname, '..', 'injury-watch', 'CONTEXT.md'),
}

const MIN_SIGNALS_FOR_PROPOSAL = 3

// ─── Signal Writing ───────────────────────────────────────────────────────────

export interface LearningSignalInput {
  agentType: string
  signalType: 'low_confidence' | 'chat_failure' | 'manual'
  runId?: string
  userMessage?: string
  agentResponse?: string
  confidenceScore?: number
  inputSummary?: string
  outputSummary?: string
  detectedPattern?: string
}

/**
 * Write a learning signal and, if threshold is reached, trigger proposal generation.
 */
export async function writeLearningSignal(input: LearningSignalInput): Promise<void> {
  await db.learningSignal.create({
    data: {
      agentType: input.agentType,
      signalType: input.signalType,
      runId: input.runId,
      userMessage: input.userMessage,
      agentResponse: input.agentResponse,
      confidenceScore: input.confidenceScore,
      inputSummary: input.inputSummary,
      outputSummary: input.outputSummary,
      detectedPattern: input.detectedPattern,
    },
  })

  // Check if we've hit the threshold for proposal generation
  const unprocessed = await db.learningSignal.count({
    where: {
      agentType: input.agentType,
      signalType: input.signalType,
      proposalId: null,
    },
  })

  if (unprocessed >= MIN_SIGNALS_FOR_PROPOSAL) {
    await generateProposal(input.agentType, input.signalType).catch((err) => {
      console.warn(`[context-revision] Proposal generation failed for ${input.agentType}:`, err)
    })
  }
}

// ─── Stage 2: Proposal Generation ────────────────────────────────────────────

/**
 * Nightly pass: check all agent+signal groups and generate proposals for any
 * that have accumulated 3+ unprocessed signals.
 */
export async function runContextRevisionJob(): Promise<void> {
  console.log('[context-revision] Starting nightly proposal generation pass')

  const groups = await db.learningSignal.groupBy({
    by: ['agentType', 'signalType'],
    where: { proposalId: null },
    _count: { id: true },
  })

  let generated = 0
  for (const group of groups) {
    if (group._count.id >= MIN_SIGNALS_FOR_PROPOSAL) {
      try {
        await generateProposal(group.agentType, group.signalType)
        generated++
      } catch (err) {
        console.warn(`[context-revision] Failed for ${group.agentType}/${group.signalType}:`, err)
      }
    }
  }

  console.log(`[context-revision] Complete — generated=${generated} proposals`)
}

async function generateProposal(agentType: string, signalType: string): Promise<void> {
  const signals = await db.learningSignal.findMany({
    where: { agentType, signalType, proposalId: null },
    orderBy: { createdAt: 'asc' },
    take: 10,
  })

  if (signals.length < MIN_SIGNALS_FOR_PROPOSAL) return

  const contextPath = resolveContextPath(AGENT_CONTEXT_PATHS[agentType])
  if (!contextPath) {
    console.warn(`[context-revision] No CONTEXT.md found for ${agentType}`)
    return
  }

  const currentContext = readFileSync(contextPath, 'utf-8')

  const signalSummary = signals
    .map((s, i) => {
      const parts = [`Signal ${i + 1} (${s.signalType} — ${s.createdAt.toISOString().split('T')[0]})`]
      if (s.userMessage) parts.push(`User: "${s.userMessage.slice(0, 200)}"`)
      if (s.agentResponse) parts.push(`Agent: "${s.agentResponse.slice(0, 200)}"`)
      if (s.confidenceScore != null) parts.push(`Confidence: ${s.confidenceScore}%`)
      if (s.outputSummary) parts.push(`Output: ${s.outputSummary.slice(0, 200)}`)
      if (s.detectedPattern) parts.push(`Pattern: ${s.detectedPattern}`)
      return parts.join('\n')
    })
    .join('\n\n')

  const systemPrompt = `You are an AI assistant analyzing failure patterns in a fantasy football agent system.

You will receive:
1. The agent's current CONTEXT.md
2. A batch of failure signals (low confidence runs or chat failures)

Your task:
1. Identify the root cause of the failures
2. Determine which section of CONTEXT.md needs to change
3. Draft a targeted, minimal edit to that specific section

Rules:
- Focus on ONE specific improvement — not a full rewrite
- Be concrete: say exactly what to add, change, or remove
- Identify the section heading (e.g. "## Learned Preferences", "## Output Gaps Logged")
- Return JSON in this exact shape:
{
  "problem": "one sentence describing what's failing",
  "rootCause": "one sentence on why it's failing",
  "affectedSection": "## Section Name",
  "proposedEdit": "the new text for that section, or the specific lines to add/change"
}`

  const userPrompt = `Agent Type: ${agentType}
Signal Type: ${signalType}
Signal Count: ${signals.length}

Current CONTEXT.md:
${currentContext}

---
Failure Signals:
${signalSummary}

Analyze the pattern and return JSON.`

  const result = await LLMConnector.complete({
    systemPrompt,
    userPrompt,
    model: 'sonnet',
    maxTokens: 1000,
  })

  let parsed: { problem: string; rootCause: string; affectedSection: string; proposedEdit: string }
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    console.warn(`[context-revision] Could not parse LLM response for ${agentType}`)
    return
  }

  const proposal = await db.learningProposal.create({
    data: {
      agentType,
      signalType,
      signalCount: signals.length,
      problem: parsed.problem,
      rootCause: parsed.rootCause,
      affectedSection: parsed.affectedSection,
      aiDraftEdit: parsed.proposedEdit,
      status: 'pending',
    },
  })

  // Link signals to this proposal
  await db.learningSignal.updateMany({
    where: { id: { in: signals.map((s) => s.id) } },
    data: { proposalId: proposal.id },
  })

  console.log(`[context-revision] Created proposal ${proposal.id} for ${agentType}/${signalType}`)
}

// ─── Stage 3: Apply / Rollback ────────────────────────────────────────────────

/**
 * Apply an approved proposal: snapshot CONTEXT.md before + after, patch the file.
 */
export async function applyProposal(proposalId: string): Promise<void> {
  const proposal = await db.learningProposal.findUniqueOrThrow({
    where: { id: proposalId },
  })

  if (proposal.status !== 'pending') {
    throw new Error(`Proposal ${proposalId} is already ${proposal.status}`)
  }

  const contextPath = resolveContextPath(AGENT_CONTEXT_PATHS[proposal.agentType])
  if (!contextPath) {
    throw new Error(`No CONTEXT.md found for ${proposal.agentType}`)
  }

  const currentContent = readFileSync(contextPath, 'utf-8')
  const editToApply = proposal.adminFinalEdit ?? proposal.aiDraftEdit

  // Snapshot before
  await db.agentContextVersion.create({
    data: {
      agentType: proposal.agentType,
      contextMd: currentContent,
      proposalId,
      versionType: 'approved',
    },
  })

  // Patch the affected section
  const newContent = patchSection(currentContent, proposal.affectedSection, editToApply)
  writeFileSync(contextPath, newContent, 'utf-8')

  // Snapshot after
  await db.agentContextVersion.create({
    data: {
      agentType: proposal.agentType,
      contextMd: newContent,
      proposalId,
      versionType: 'approved',
    },
  })

  await db.learningProposal.update({
    where: { id: proposalId },
    data: { status: 'approved', appliedAt: new Date(), reviewedAt: new Date() },
  })

  console.log(`[context-revision] Applied proposal ${proposalId} to ${proposal.agentType} CONTEXT.md`)
}

/**
 * Rollback to a prior CONTEXT.md snapshot.
 */
export async function rollbackToVersion(versionId: string): Promise<void> {
  const version = await db.agentContextVersion.findUniqueOrThrow({
    where: { id: versionId },
  })

  const contextPath = resolveContextPath(AGENT_CONTEXT_PATHS[version.agentType])
  if (!contextPath) {
    throw new Error(`No CONTEXT.md found for ${version.agentType}`)
  }

  const currentContent = readFileSync(contextPath, 'utf-8')

  // Snapshot current state before rollback
  await db.agentContextVersion.create({
    data: {
      agentType: version.agentType,
      contextMd: currentContent,
      versionType: 'rollback',
    },
  })

  writeFileSync(contextPath, version.contextMd, 'utf-8')

  console.log(`[context-revision] Rolled back ${version.agentType} to version ${versionId}`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveContextPath(primaryPath: string | undefined): string | null {
  if (!primaryPath) return null
  if (existsSync(primaryPath)) return primaryPath
  const srcPath = primaryPath.replace(/[/\\]dist[/\\]/, '/src/')
  if (existsSync(srcPath)) return srcPath
  return null
}

/**
 * Replace or append a named section (## Heading) with new content.
 */
function patchSection(fullContext: string, sectionHeading: string, newSectionContent: string): string {
  const escapedHeading = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`${escapedHeading}[\\s\\S]*?(?=\\n## |\\s*$)`)
  const match = fullContext.match(pattern)

  if (!match) {
    // Section not found — append
    return `${fullContext.trim()}\n\n${newSectionContent}\n`
  }

  return fullContext.replace(pattern, newSectionContent)
}
