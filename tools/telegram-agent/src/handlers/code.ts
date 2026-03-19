import type { Context } from 'grammy'
import OpenAI from 'openai'
import { readFile, readdir, stat } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve, relative, join } from 'path'
import { injectMemory } from '../memory.js'
import { sendForApproval } from '../approval.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT =
  process.env.WORKSPACE_PATH ?? resolve(__dirname, '../../../../')

const IGNORED = new Set([
  'node_modules',
  '.git',
  'dist',
  '.next',
  '.turbo',
  'build',
  'coverage',
  '.vscode',
  'test-results',
  'scratch',
  'openclaw',
  'pnpm-lock.yaml',
])

const MAX_FILES_TO_READ = 12
const MAX_FILE_CHARS = 60_000
const MAX_TREE_CHARS = 6_000

export async function handleCode(ctx: Context, task: string): Promise<void> {
  await ctx.reply('🤖 Thinking...')

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    // Step 1: Build workspace file tree
    const tree = (await buildTree(WORKSPACE_ROOT)).slice(0, MAX_TREE_CHARS)

    // Step 2: Ask gpt-4o-mini which files to read
    const planRes = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are an AI coding agent. The user's task: "${task}"

Workspace file tree:
${tree}

List the file paths (relative to workspace root) needed to complete this task.
Return ONLY a JSON array of paths, nothing else. Max ${MAX_FILES_TO_READ} files.
Example: ["apps/api/src/index.ts", "packages/shared/src/types/agent.ts"]`,
        },
      ],
    })

    const planText = planRes.choices[0]?.message.content ?? '[]'
    let filePaths: string[] = []
    try {
      const match = planText.match(/\[[\s\S]*?\]/)
      filePaths = (JSON.parse(match?.[0] ?? '[]') as string[]).slice(0, MAX_FILES_TO_READ)
    } catch {
      filePaths = []
    }

    // Step 3: Read those files
    const fileContents = await readFiles(filePaths)

    // Step 4: Generate the changes with gpt-4o
    const systemPrompt = await injectMemory(`You are an AI coding agent working on "rzf-workspace" (Red Zone Fantasy) — a TypeScript pnpm monorepo. Write clean, minimal changes that match existing patterns exactly.

IMPORTANT: Respond with ONLY a JSON object matching this exact structure:
{
  "summary": "one-sentence plain-text description of the change",
  "commitMessage": "conventional commit, e.g. feat(worker): add Reddit ingestion job",
  "isQuestion": false,
  "files": [
    { "path": "relative/path/from/workspace/root.ts", "content": "complete file content here" }
  ]
}

Rules:
- If the task is a question (not a code change), set isQuestion:true, put the answer in summary, and set files:[]
- Return complete file contents, not just diffs
- Keep changes minimal — only touch what's needed
- Follow the existing code style exactly`)

    await ctx.reply('⚙️ Generating changes...')

    const codeRes = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 8000,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Task: ${task}

Current file contents:
${fileContents}

Complete the task and return the JSON response.`,
        },
      ],
    })

    const rawOutput = codeRes.choices[0]?.message.content?.trim() ?? ''

    // Extract JSON from Claude's response
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Claude returned a plain text answer
      await ctx.reply(rawOutput.slice(0, 4000))
      return
    }

    const result = JSON.parse(jsonMatch[0]) as {
      summary: string
      commitMessage: string
      isQuestion: boolean
      files: Array<{ path: string; content: string }>
    }

    // Questions get a direct reply
    if (result.isQuestion || !result.files || result.files.length === 0) {
      await ctx.reply(result.summary)
      return
    }

    // Code changes go through approval gate
    await sendForApproval(ctx, {
      files: result.files,
      commitMessage: result.commitMessage,
      summary: result.summary,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await ctx.reply(`❌ Error: ${msg}`)
  }
}

async function buildTree(
  dir: string,
  depth = 0,
  maxDepth = 4,
): Promise<string> {
  if (depth > maxDepth) return ''

  let result = ''
  let entries: string[] = []

  try {
    entries = await readdir(dir)
  } catch {
    return ''
  }

  for (const entry of entries.sort()) {
    if (IGNORED.has(entry) || entry.startsWith('.')) continue

    const fullPath = join(dir, entry)
    const relPath = relative(WORKSPACE_ROOT, fullPath)

    try {
      const s = await stat(fullPath)
      if (s.isDirectory()) {
        result += `${'  '.repeat(depth)}${entry}/\n`
        result += await buildTree(fullPath, depth + 1, maxDepth)
      } else {
        result += `${'  '.repeat(depth)}${relPath}\n`
      }
    } catch {
      // skip unreadable entries
    }
  }

  return result
}

async function readFiles(paths: string[]): Promise<string> {
  const parts: string[] = []

  for (const p of paths) {
    const fullPath = resolve(WORKSPACE_ROOT, p)
    try {
      let content = await readFile(fullPath, 'utf-8')
      if (content.length > MAX_FILE_CHARS) {
        content = content.slice(0, MAX_FILE_CHARS) + '\n... [truncated]'
      }
      parts.push(`=== ${p} ===\n${content}`)
    } catch {
      parts.push(`=== ${p} === [could not read — may not exist yet]`)
    }
  }

  return parts.join('\n\n')
}
