/**
 * NFL Schedule-Aware Recency Utility
 *
 * Adjusts content recency windows based on the current day of the NFL week.
 * The goal: inject more recent data near game days so agents have the freshest
 * injury, depth-chart, and matchup context when it matters most.
 *
 * NFL week structure (all times ET):
 *   Thu  - Thursday Night Football (~8:15pm)
 *   Sun  - Main slate (1pm, 4pm, 8:20pm SNF)
 *   Mon  - Monday Night Football (~8:15pm)
 *   Tue/Wed - Off days, light news
 *   Fri/Sat - Injury designations finalized
 */

/** Day-of-week constants (matching JS Date.getDay()) */
const SUN = 0
const MON = 1
const THU = 4
const FRI = 5
const SAT = 6

/**
 * Returns the adjusted recency window in hours for a given agent type
 * based on the current time relative to the NFL schedule.
 *
 * @param agentType - e.g. 'injury_watch', 'lineup', 'waiver'
 * @param baseWindowHours - the configured default window (from AgentConfig.recencyWindowHours)
 * @param now - override for testing; defaults to current time
 */
export function adjustWindowForSchedule(
  agentType: string,
  baseWindowHours: number,
  now: Date = new Date(),
): number {
  const day = now.getDay()
  const hour = now.getHours()

  // Injury Watch: always use tightest window near game activity
  if (agentType === 'injury_watch') {
    // Sunday game day or early Monday (game just ended): 12h — very fresh injury data only
    if (day === SUN || (day === MON && hour < 6)) return 12
    // Thursday Night game day (evening): 12h
    if (day === THU && hour >= 16) return 12
    // Friday/Saturday: injury designations being finalized: 24h
    if (day === FRI || day === SAT) return 24
    // Otherwise fall through to base (never wider than base)
    return Math.min(baseWindowHours, 48)
  }

  // Lineup optimizer: tighten on game days and the day before
  if (agentType === 'lineup') {
    if (day === SUN || (day === MON && hour < 6)) return Math.min(baseWindowHours, 24)
    if (day === FRI || day === SAT) return Math.min(baseWindowHours, 36)
    if (day === THU && hour >= 16) return Math.min(baseWindowHours, 24)
    return baseWindowHours
  }

  // All other agents: return the configured base window unchanged
  return baseWindowHours
}

/**
 * Returns a human-readable label for the current NFL week period.
 * Useful for logging.
 */
export function getNFLWeekPeriod(now: Date = new Date()): string {
  const day = now.getDay()
  const hour = now.getHours()
  if (day === SUN) return 'game-day-sunday'
  if (day === MON && hour < 6) return 'post-mnf'
  if (day === MON) return 'monday-post-week'
  if (day === 1 + 1) return 'tuesday-reset' // TUE=2, but using literal for clarity
  if (day === 3) return 'wednesday-prep'
  if (day === THU && hour < 16) return 'thursday-pre-tnf'
  if (day === THU && hour >= 16) return 'thursday-tnf-gameday'
  if (day === FRI) return 'friday-injury-designations'
  if (day === SAT) return 'saturday-final-injury-report'
  return 'unknown'
}
