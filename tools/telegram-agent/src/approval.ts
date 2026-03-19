import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import simpleGit from 'simple-git'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKSPACE_ROOT =
  process.env.WORKSPACE_PATH ?? resolve(__dirname, '../../../')

export interface PendingApproval {
  files: Array<{ path: string; content: string }>
  commitMessage: string
  summary: string
}

// Keyed by Telegram chat ID — one pending approval per chat at a time
const pendingApprovals = new Map<number, PendingApproval>()

export async function sendForApproval(
  ctx: Context,
  approval: PendingApproval,
): Promise<void> {
  const chatId = ctx.chat!.id
  pendingApprovals.set(chatId, approval)

  const fileList = approval.files.map((f) => `• \`${f.path}\``).join('\n')

  const keyboard = new InlineKeyboard()
    .text('✅ Approve & Push', 'approve')
    .text('❌ Discard', 'discard')

  await ctx.reply(
    `✏️ *Here's what I did:*\n${approval.summary}\n\n*Files changed:*\n${fileList}\n\n📝 Commit: \`${approval.commitMessage}\``,
    { reply_markup: keyboard, parse_mode: 'Markdown' },
  )
}

export async function handleCallbackQuery(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const data = ctx.callbackQuery?.data
  const approval = pendingApprovals.get(chatId)

  await ctx.answerCallbackQuery()

  if (!approval) {
    await ctx.reply('No pending approval found. The session may have restarted.')
    return
  }

  if (data === 'discard') {
    pendingApprovals.delete(chatId)
    await ctx.reply('🗑 Changes discarded.')
    return
  }

  if (data === 'approve') {
    pendingApprovals.delete(chatId)
    await ctx.reply('⏳ Writing files and pushing...')

    try {
      // Write all changed files to disk
      for (const file of approval.files) {
        const fullPath = resolve(WORKSPACE_ROOT, file.path)
        await writeFile(fullPath, file.content, 'utf-8')
      }

      // Stage, commit, push
      const git = simpleGit(WORKSPACE_ROOT)
      await git.add('.')
      const commitResult = await git.commit(approval.commitMessage)
      await git.push()

      const sha = commitResult.commit?.slice(0, 7) ?? 'unknown'
      await ctx.reply(
        `✅ Pushed! Commit \`${sha}\`\n${approval.commitMessage}`,
        { parse_mode: 'Markdown' },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await ctx.reply(`❌ Git error: ${msg}`)
    }
  }
}
