#!/usr/bin/env tsx
/**
 * sync-docs.ts
 * Regenerates auto-managed sections of living docs from source of truth.
 * Run: pnpm sync:docs
 *
 * Currently manages:
 * - docs/DATA.md: Schema reference table from prisma/schema.prisma
 * - docs/AGENTS.md: Agent I/O contracts from packages/agents/*\/types.ts
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Helpers ────────────────────────────────────────────────────────────────

function readFile(relPath: string): string {
  const abs = join(ROOT, relPath)
  if (!existsSync(abs)) return ''
  return readFileSync(abs, 'utf-8')
}

function writeFile(relPath: string, content: string): void {
  const abs = join(ROOT, relPath)
  writeFileSync(abs, content, 'utf-8')
  console.log(`  ✓ Updated ${relPath}`)
}

function replaceBetweenMarkers(
  content: string,
  startMarker: string,
  endMarker: string,
  newSection: string,
): string {
  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)
  if (startIdx === -1 || endIdx === -1) {
    // Markers not found — append section
    return content + '\n' + newSection
  }
  return content.slice(0, startIdx) + startMarker + '\n' + newSection + '\n' + endMarker + content.slice(endIdx + endMarker.length)
}

// ─── Prisma Schema Parser ────────────────────────────────────────────────────

function parsePrismaModels(schema: string): Array<{ name: string; fields: Array<{ name: string; type: string; optional: boolean; comment: string }> }> {
  const models: ReturnType<typeof parsePrismaModels> = []
  const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g
  let match

  while ((match = modelRegex.exec(schema)) !== null) {
    const modelName = match[1]!
    const body = match[2]!
    const fields: (typeof models)[0]['fields'] = []

    for (const line of body.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@') || trimmed.startsWith('@')) continue

      const fieldMatch = trimmed.match(/^(\w+)\s+([\w?[\]]+)(.*)$/)
      if (!fieldMatch) continue

      const [, fieldName, fieldType, rest] = fieldMatch
      const comment = rest?.match(/\/\/\s*(.+)$/)?.[1]?.trim() ?? ''

      fields.push({
        name: fieldName!,
        type: fieldType!.replace('?', ''),
        optional: fieldType!.includes('?') || fieldType!.includes('[]'),
        comment,
      })
    }

    if (fields.length > 0) {
      models.push({ name: modelName!, fields })
    }
  }

  return models
}

function generateSchemaTable(model: ReturnType<typeof parsePrismaModels>[0]): string {
  const rows = model.fields
    .map((f) => `| ${f.name} | ${f.type}${f.optional ? '?' : ''} | ${f.comment} |`)
    .join('\n')
  return `### \`${model.name}\`\n\n| Field | Type | Notes |\n|-------|------|-------|\n${rows}\n`
}

// ─── Agent Types Parser ──────────────────────────────────────────────────────

function findAgentTypeFiles(): string[] {
  const agentsDir = join(ROOT, 'packages', 'agents', 'src')
  if (!existsSync(agentsDir)) return []

  const files: string[] = []
  for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const typesFile = join(agentsDir, entry.name, 'types.ts')
      if (existsSync(typesFile)) files.push(typesFile)
    }
  }
  return files
}

function extractTypeBlock(content: string, typeName: string): string {
  const regex = new RegExp(`export type ${typeName}\\s*=\\s*\\{[^}]+\\}`, 'g')
  const match = regex.exec(content)
  return match ? match[0] : ''
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Syncing docs from source of truth...\n')

  // ── 1. Sync docs/DATA.md schema section from Prisma schema ───────────────
  const schemaPath = 'packages/db/prisma/schema.prisma'
  const schema = readFile(schemaPath)

  if (schema) {
    const models = parsePrismaModels(schema)
    const schemaSection = models.map(generateSchemaTable).join('\n')
    const dataMd = readFile('docs/DATA.md')

    const START = '<!-- AUTO:SCHEMA:START -->'
    const END = '<!-- AUTO:SCHEMA:END -->'

    if (dataMd.includes(START)) {
      const updated = replaceBetweenMarkers(dataMd, START, END, schemaSection)
      writeFile('docs/DATA.md', updated)
    } else {
      console.log('  ℹ  docs/DATA.md: no AUTO:SCHEMA markers found — skipping schema injection')
    }
  } else {
    console.log(`  ⚠  ${schemaPath} not found yet — skipping schema sync`)
  }

  // ── 2. Sync docs/AGENTS.md I/O contracts from agent types ────────────────
  const agentTypeFiles = findAgentTypeFiles()

  if (agentTypeFiles.length > 0) {
    const agentsMd = readFile('docs/AGENTS.md')
    const START = '<!-- AUTO:AGENT-TYPES:START -->'
    const END = '<!-- AUTO:AGENT-TYPES:END -->'

    if (agentsMd.includes(START)) {
      let contractsSection = ''
      for (const file of agentTypeFiles) {
        const content = readFileSync(file, 'utf-8')
        const inputType = extractTypeBlock(content, '\\w+Input')
        const outputType = extractTypeBlock(content, '\\w+Output')
        if (inputType || outputType) {
          contractsSection += `\`\`\`typescript\n${inputType}\n\n${outputType}\n\`\`\`\n\n`
        }
      }
      const updated = replaceBetweenMarkers(agentsMd, START, END, contractsSection)
      writeFile('docs/AGENTS.md', updated)
    } else {
      console.log('  ℹ  docs/AGENTS.md: no AUTO:AGENT-TYPES markers found — skipping')
    }
  } else {
    console.log('  ℹ  No agent types files found yet — skipping agent types sync')
  }

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error('sync-docs failed:', err)
  process.exit(1)
})
