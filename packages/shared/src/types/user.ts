import { z } from 'zod'

// Mirror of Prisma enums for use in non-DB packages
export const UserTierSchema = z.enum(['free', 'paid'])
export type UserTier = z.infer<typeof UserTierSchema>

export const UserRoleSchema = z.enum(['user', 'admin'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const LeagueStyleSchema = z.enum(['redraft', 'keeper', 'dynasty'])
export type LeagueStyle = z.infer<typeof LeagueStyleSchema>

export const ScoringPrioritySchema = z.enum(['ppr', 'half_ppr', 'standard'])
export type ScoringPriority = z.infer<typeof ScoringPrioritySchema>

export const PlayStyleSchema = z.enum(['safe_floor', 'balanced', 'boom_bust'])
export type PlayStyle = z.infer<typeof PlayStyleSchema>

export const ReportFormatSchema = z.enum(['detailed', 'concise'])
export type ReportFormat = z.infer<typeof ReportFormatSchema>

// Represents UserPreferences as used by agents
export const UserContextPrefsSchema = z.object({
  leagueStyle: LeagueStyleSchema,
  scoringPriority: ScoringPrioritySchema,
  playStyle: PlayStyleSchema,
  reportFormat: ReportFormatSchema,
  priorityPositions: z.array(z.string()),
  customInstructions: z.string().nullable(),
})

export type UserContextPrefs = z.infer<typeof UserContextPrefsSchema>

/**
 * Converts UserPreferences into a terse, token-efficient context block
 * that is prepended to every agent's system prompt.
 */
export function buildUserContext(prefs: UserContextPrefs | null): string {
  if (!prefs) return ''

  const lines: string[] = [
    `League format: ${prefs.leagueStyle}, ${prefs.scoringPriority.replace('_', '-')} scoring`,
    `Play style preference: ${prefs.playStyle.replace('_', ' ')}`,
    `Report format: ${prefs.reportFormat}`,
  ]

  if (prefs.priorityPositions.length > 0) {
    lines.push(`Priority positions: ${prefs.priorityPositions.join(', ')}`)
  }

  if (prefs.customInstructions) {
    lines.push(`User instructions: ${prefs.customInstructions}`)
  }

  return `[User Context]\n${lines.join('\n')}\n`
}
