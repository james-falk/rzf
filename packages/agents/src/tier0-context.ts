import { formatTierZeroRankingsForPrompt, loadTierZeroPlayerRankings } from './tier0-rankings.js'

/**
 * Static tier-0 ranking block for agent prompts (week/season scoped).
 * `sleeperIds` must match `Player.sleeperId` / `PlayerRanking.playerId`.
 */
export async function buildTierZeroContext(
  sleeperIds: string[],
  week: number,
  season: number,
): Promise<string> {
  if (sleeperIds.length === 0) return ''

  const rankings = await loadTierZeroPlayerRankings(sleeperIds, week, season)
  const block = formatTierZeroRankingsForPrompt(rankings)
  if (!block.trim()) return ''

  return [
    'GROUND_TRUTH_DATA (tier-0 expert/platform ranks for this NFL week; use with tool output):',
    block,
  ].join('\n')
}
