import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load workspace .env before anything else
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../../.env') })

import { Bot } from 'grammy'
import { router } from './router.js'
import { handleCallbackQuery } from './approval.js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ALLOWED_USER_ID = parseInt(process.env.TELEGRAM_ALLOWED_USER_ID ?? '0', 10)

if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required — set it in .env')
if (!ALLOWED_USER_ID) throw new Error('TELEGRAM_ALLOWED_USER_ID is required — set it in .env')
if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required — set it in .env')
if (!process.env.ADMIN_SECRET) throw new Error('ADMIN_SECRET is required — set it in .env')

const bot = new Bot(BOT_TOKEN)

// Security: silently drop all messages from non-whitelisted users
bot.use(async (ctx, next) => {
  if (ctx.from?.id !== ALLOWED_USER_ID) return
  await next()
})

// Inline keyboard callbacks (approve/discard code changes)
bot.on('callback_query:data', handleCallbackQuery)

// All text messages go through the router
bot.on('message:text', router)

// Start long-polling — Grammy handles reconnection automatically
bot.start({
  onStart: (info) => {
    console.log(`[telegram-agent] ✅ Bot @${info.username} started`)
    console.log(`[telegram-agent] Allowed user ID: ${ALLOWED_USER_ID}`)
    console.log(`[telegram-agent] API base: ${process.env.TELEGRAM_API_BASE_URL ?? 'http://localhost:3001'}`)
  },
})

process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())
