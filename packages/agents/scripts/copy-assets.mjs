/**
 * Copies CONTEXT.md files from src/ to dist/ after TypeScript compilation.
 * Run via: node scripts/copy-assets.mjs
 */
import { cpSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const agents = [
  'player-scout',
  'trade-analysis',
  'team-eval',
  'player-compare',
  'waiver',
  'lineup',
  'injury-watch',
  'chat',
]

for (const agent of agents) {
  const src = join(root, 'src', agent, 'CONTEXT.md')
  const dstDir = join(root, 'dist', agent)
  const dst = join(dstDir, 'CONTEXT.md')

  if (!existsSync(src)) continue

  if (!existsSync(dstDir)) {
    mkdirSync(dstDir, { recursive: true })
  }

  cpSync(src, dst)
  console.log(`Copied ${agent}/CONTEXT.md → dist/`)
}
