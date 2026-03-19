import { readFile, writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const MEMORY_PATH = resolve(__dirname, '../../memory/agent-memory.md')

const MEMORY_TRIGGERS = [
  /^remember\s+/i,
  /^save\s+/i,
  /^forget\s+/i,
  /^remove\s+/i,
  /^talk to me\s+(more\s+)?(like|as|in a)\s+/i,
  /^(use\s+.+\s+tone|be\s+more\s+\w+)/i,
  /^my default league\s+(id\s+)?is\s+/i,
  /^show memory$/i,
  /^what do you (know|remember)(\?)?$/i,
]

export function isMemoryCommand(text: string): boolean {
  return MEMORY_TRIGGERS.some((r) => r.test(text.trim()))
}

export async function loadMemory(): Promise<string> {
  try {
    return await readFile(MEMORY_PATH, 'utf-8')
  } catch {
    return DEFAULT_MEMORY
  }
}

export async function saveMemory(content: string): Promise<void> {
  await mkdir(resolve(__dirname, '../../memory'), { recursive: true })
  await writeFile(MEMORY_PATH, content, 'utf-8')
}

/** Prepend current memory to any system prompt sent to Claude. */
export async function injectMemory(systemPrompt: string): Promise<string> {
  const memory = await loadMemory()
  return `[Agent Memory — always read this before responding]\n${memory}\n\n---\n\n${systemPrompt}`
}

export async function handleMemoryCommand(text: string): Promise<string> {
  const lower = text.trim().toLowerCase()

  if (/^(show memory|what do you (know|remember)(\?)?)$/.test(lower)) {
    const memory = await loadMemory()
    return `📋 *Current memory:*\n\`\`\`\n${memory}\n\`\`\``
  }

  // Use Claude Haiku to intelligently update the memory file
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const currentMemory = await loadMemory()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `You are managing a persistent memory file for an AI assistant. The user sent this instruction: "${text}"

Current memory file:
${currentMemory}

Instructions:
- "remember [X]" or "save [X]": add X to the most appropriate section
- "forget [X]" or "remove [X]": find and remove the closest matching entry
- "talk to me like [X]" or "use [X] tone" or "be more [X]": update the "Response style" line under User Preferences
- "my default league is [ID]": update the "Default league ID" line under User Preferences
- Return ONLY the complete updated markdown file, no commentary before or after`,
      },
    ],
  })

  const updatedMemory =
    response.content[0]?.type === 'text' ? response.content[0].text.trim() : currentMemory

  await saveMemory(updatedMemory)
  return '✅ Got it, saved to memory.'
}

const DEFAULT_MEMORY = `# Agent Memory

## User Preferences
- Response style: concise, casual
- Default league ID: (not set)

## Leagues
(none saved yet)

## Remembered Facts
(none saved yet)

## Coding Preferences
(none saved yet)
`
