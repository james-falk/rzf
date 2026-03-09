import Anthropic from '@anthropic-ai/sdk'
import { env } from '@rzf/shared/env'

export type LLMModel = 'haiku' | 'sonnet'

const MODEL_IDS: Record<LLMModel, string> = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-5',
}

// Max tokens for structured agent outputs
const MAX_TOKENS: Record<LLMModel, number> = {
  haiku: 1024,
  sonnet: 2048,
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

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for LLMConnector')
    }
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }
  return _client
}

export const LLMConnector = {
  /**
   * Send a structured prompt to Claude and return the text response + token usage.
   * Default model: Haiku (cheap, fast — ~$0.001/run at <2500 tokens).
   * Use Sonnet only for complex multi-step reasoning.
   */
  async complete(options: LLMCompleteOptions): Promise<LLMResult> {
    const {
      model = 'haiku',
      systemPrompt,
      userPrompt,
      maxTokens,
    } = options

    const client = getClient()
    const modelId = MODEL_IDS[model]
    const resolvedMaxTokens = maxTokens ?? MAX_TOKENS[model]

    const response = await client.messages.create({
      model: modelId!,
      max_tokens: resolvedMaxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    const tokensUsed =
      (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0)

    return { content, tokensUsed, model: modelId! }
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
