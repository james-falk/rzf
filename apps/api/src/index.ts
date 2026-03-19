import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { env } from '@rzf/shared/env'
import { usersRoutes } from './routes/users.js'
import { sleeperRoutes } from './routes/sleeper.js'
import { agentsRoutes } from './routes/agents.js'
import { webhooksRoutes } from './routes/webhooks.js'
import { internalRoutes } from './routes/internal.js'
import { intentRoutes } from './routes/intent.js'
import { playersRoutes } from './routes/players.js'
import { billingRoutes } from './routes/billing.js'
import { feedbackRoutes } from './routes/feedback.js'
import { sessionsRoutes } from './routes/sessions.js'
import { xEngineRoutes } from './routes/x-engine.js'
import { chatRoutes } from './routes/chat.js'

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

// ── Plugins ────────────────────────────────────────────────────────────────────
await app.register(helmet)
const allowedOrigins =
  env.NODE_ENV === 'production'
    ? (env.CORS_ORIGIN ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : []
await app.register(cors, {
  origin:
    env.NODE_ENV === 'production'
      ? allowedOrigins.length > 0
        ? allowedOrigins
        : ['https://rzf-web.vercel.app'] // default when CORS_ORIGIN not set on Render
      : true,
  credentials: true,
})

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

// ── Routes ────────────────────────────────────────────────────────────────────
await app.register(webhooksRoutes) // webhooks before auth (svix handles its own sig verification)
await app.register(usersRoutes)
await app.register(sleeperRoutes)
await app.register(agentsRoutes)
await app.register(intentRoutes)
await app.register(playersRoutes)
await app.register(billingRoutes)
await app.register(feedbackRoutes)
await app.register(sessionsRoutes)
await app.register(chatRoutes)
await app.register(xEngineRoutes)
await app.register(internalRoutes)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = env.PORT

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`[api] Red Zone Fantasy API running on :${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
