import { z } from 'zod'

const contentTypeEnum = z.enum(['article', 'video', 'social_post', 'podcast_episode', 'vlog', 'stat_update'])

/** NFL team abbreviations (uppercase) — lenient list for validation */
const NFL_TEAM = new Set([
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR',
  'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS',
])

export const customFeedConfigSchema = z.discriminatedUnion('feedType', [
  z.object({
    feedType: z.literal('sources'),
    sourceIds: z.array(z.string().min(1)).min(1).max(50),
    contentTypes: z.array(contentTypeEnum).optional(),
  }),
  z.object({
    feedType: z.literal('players'),
    playerIds: z.array(z.string().min(1)).min(1).max(10),
  }),
  z.object({
    feedType: z.literal('team'),
    teamAbbr: z
      .string()
      .min(2)
      .max(4)
      .transform((s) => s.toUpperCase())
      .refine((s) => NFL_TEAM.has(s), 'Invalid NFL team abbreviation'),
  }),
  z.object({
    feedType: z.literal('sleeper'),
    sleeperLeagueId: z.string().min(1),
  }),
])

export type CustomFeedConfig = z.infer<typeof customFeedConfigSchema>

export function parseCustomFeedConfig(json: unknown): CustomFeedConfig {
  return customFeedConfigSchema.parse(json)
}
