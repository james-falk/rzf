import { z } from 'zod'

/**
 * Zod-validated environment schema — single source of truth for all env vars.
 *
 * RULE: Never read process.env.ANYTHING directly in app code.
 * Always import from this file: import { env } from '@rzf/shared/env'
 *
 * This is enforced by the ESLint no-restricted-syntax rule in eslint.config.js.
 * If a required var is missing, the process crashes at startup with a clear error.
 */

const envSchema = z.object({
  // ── Node ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // ── Redis ─────────────────────────────────────────────────────────────────
  // Local dev: standard redis:// URL
  // Production: Upstash REST (preferred for serverless/edge compatibility)
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── Auth (Clerk) ──────────────────────────────────────────────────────────
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/onboarding'),

  // ── LLM Providers ─────────────────────────────────────────────────────────
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // ── Fantasy Data ──────────────────────────────────────────────────────────
  // Sleeper API is fully public — no key required
  FANTASYPROS_API_KEY: z.string().optional(),

  // ── Notifications ─────────────────────────────────────────────────────────
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),

  // ── Payments ──────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ── Browse-Mode Agents (Phase 5) ──────────────────────────────────────────
  ORGO_API_KEY: z.string().optional(),

  // ── Internal / App Config ─────────────────────────────────────────────────
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1).max(65535))
    .default('3001'),
  ADMIN_SECRET: z.string().default('change_me_in_development'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  WORKER_CONCURRENCY: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(1).max(50))
    .default('5'),
})

export type Env = z.infer<typeof envSchema>

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    for (const [field, errors] of Object.entries(result.error.flatten().fieldErrors)) {
      console.error(`  ${field}: ${(errors as string[]).join(', ')}`)
    }
    process.exit(1)
  }

  return result.data
}

// Validate once at module load time — crashes fast if config is wrong
export const env = parseEnv()
