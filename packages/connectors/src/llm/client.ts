import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { env } from '@rzf/shared/env'

export type LLMModel = 'haiku' | 'sonnet'

const ANTHROPIC_MODEL_IDS: Record<LLMModel, string> = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-5',
}

// OpenAI equivalents: haiku → gpt-4o-mini (cheap/fast), sonnet → gpt-4o
const OPENAI_MODEL_IDS: Record<LLMModel, string> = {
  haiku: 'gpt-4o-mini',
  sonnet: 'gpt-4o',
}

const MAX_TOKENS: Record<LLMModel, number> = {
  haiku: 600,
  sonnet: 4096,
}

export interface LLMCompleteOptions {
  model?: LLMModel
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}

export interface LLMResult {
  content: string
  tokensUsed: number
  model: string
}

type Provider = 'anthropic' | 'openai'

function getProvider(): Provider {
  // Prefer OpenAI — more cost-effective for our use case (gpt-4o-mini)
  if (env.OPENAI_API_KEY) return 'openai'
  if (env.ANTHROPIC_API_KEY) return 'anthropic'
  throw new Error('No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')
}

let _anthropic: Anthropic | null = null
let _openai: OpenAI | null = null

function getAnthropicClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY! })
  return _anthropic
}

function getOpenAIClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: env.OPENAI_API_KEY! })
  return _openai
}

async function completeViaAnthropic(
  model: LLMModel,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResult> {
  const client = getAnthropicClient()
  const modelId = ANTHROPIC_MODEL_IDS[model]!

  const response = await client.messages.create({
    model: modelId,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')

  const tokensUsed = (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0)
  return { content, tokensUsed, model: modelId }
}

async function completeViaOpenAI(
  model: LLMModel,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResult> {
  const client = getOpenAIClient()
  const modelId = OPENAI_MODEL_IDS[model]!

  const response = await client.chat.completions.create({
    model: modelId,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const tokensUsed = (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0)
  return { content, tokensUsed, model: modelId }
}

export const LLMConnector = {
  /**
   * Send a structured prompt to the configured LLM provider and return the text response.
   * Prefers Anthropic if ANTHROPIC_API_KEY is set, falls back to OpenAI.
   * Default model: haiku/gpt-4o-mini (cheap, fast — ~$0.001/run).
   */
  async complete(options: LLMCompleteOptions): Promise<LLMResult> {
    const { model = 'haiku', systemPrompt, userPrompt, maxTokens } = options
    const resolvedMaxTokens = maxTokens ?? MAX_TOKENS[model]
    const provider = getProvider()

    if (provider === 'anthropic') {
      return completeViaAnthropic(model, systemPrompt, userPrompt, resolvedMaxTokens)
    }
    return completeViaOpenAI(model, systemPrompt, userPrompt, resolvedMaxTokens)
  },

  /**
   * Send a prompt expecting a JSON response.
   * Validates that the response is parseable JSON before returning.
   */
  async completeJSON<T>(
    options: LLMCompleteOptions,
    validator: (raw: unknown) => T,
  ): Promise<{ data: T; tokensUsed: number; model: string }> {
    const result = await LLMConnector.complete(options)

    // Strip markdown code fences if present
    const jsonStr = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim()

    let raw: unknown
    try {
      raw = JSON.parse(jsonStr)
    } catch {
      throw new Error(
        `LLM returned non-JSON response. Model: ${result.model}\nContent: ${result.content.slice(0, 200)}`,
      )
    }

    const data = validator(raw)
    return { data, tokensUsed: result.tokensUsed, model: result.model }
  },
}
