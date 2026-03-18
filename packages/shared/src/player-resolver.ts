/**
 * Player entity resolution utilities.
 *
 * Converts raw text player name mentions (e.g. "Mahomes", "P. Mahomes",
 * "Patrick Mahomes") to canonical Sleeper player IDs.
 *
 * Usage:
 *   1. generateAliases(player) — call on player ingest to build alias rows
 *   2. resolvePlayerMentions(text, aliases) — call during content ingestion
 */

// ─── Alias Generation ─────────────────────────────────────────────────────────

export interface PlayerAliasInput {
  sleeperId: string
  firstName: string
  lastName: string
  position?: string
  team?: string
}

export interface GeneratedAlias {
  playerId: string
  alias: string
  aliasType:
    | 'full_name'
    | 'last_name'
    | 'first_last_initial'
    | 'nickname'
    | 'social_handle'
    | 'abbreviation'
    | 'custom'
}

/**
 * Generate all standard name aliases for a player.
 * Call this on every player upsert to keep aliases in sync.
 */
export function generateAliases(player: PlayerAliasInput): GeneratedAlias[] {
  const aliases: GeneratedAlias[] = []
  const { sleeperId: playerId, firstName, lastName } = player

  const fn = firstName.trim()
  const ln = lastName.trim()

  if (!fn || !ln) return aliases

  // Full name: "Patrick Mahomes"
  aliases.push({ playerId, alias: `${fn} ${ln}`, aliasType: 'full_name' })

  // Last name only: "Mahomes"
  aliases.push({ playerId, alias: ln, aliasType: 'last_name' })

  // First initial + last: "P. Mahomes"
  aliases.push({ playerId, alias: `${fn[0]}. ${ln}`, aliasType: 'first_last_initial' })

  // First initial no period + last: "P Mahomes"
  aliases.push({ playerId, alias: `${fn[0]} ${ln}`, aliasType: 'abbreviation' })

  // Lowercase slug: "patrickmahomes"
  aliases.push({
    playerId,
    alias: `${fn.toLowerCase()}${ln.toLowerCase()}`,
    aliasType: 'abbreviation',
  })

  // Handle hyphenated last names: "Henry-Coleman" → also "Henry Coleman", "Coleman"
  if (ln.includes('-')) {
    const parts = ln.split('-')
    aliases.push({ playerId, alias: ln.replace('-', ' '), aliasType: 'abbreviation' })
    for (const part of parts) {
      if (part.length > 2) {
        aliases.push({ playerId, alias: part, aliasType: 'abbreviation' })
      }
    }
  }

  // Handle suffix like "Jr.", "III", "II" — strip for matching
  const lnClean = ln.replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, '').trim()
  if (lnClean !== ln) {
    aliases.push({ playerId, alias: lnClean, aliasType: 'abbreviation' })
    aliases.push({ playerId, alias: `${fn} ${lnClean}`, aliasType: 'abbreviation' })
  }

  // Deduplicate by alias string (keep first occurrence)
  const seen = new Set<string>()
  return aliases.filter((a) => {
    const key = a.alias.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Text Resolution ──────────────────────────────────────────────────────────

export interface AliasLookup {
  alias: string
  playerId: string
  aliasType: string
}

export interface PlayerMatch {
  playerId: string
  alias: string
  /** Character index in the source text where the match starts */
  startIndex: number
  /** Character index where the match ends */
  endIndex: number
}

export interface ResolveOptions {
  /**
   * When true, only match `full_name` and `first_last_initial` alias types.
   * Skips `last_name` and `abbreviation` to prevent false positives in
   * body text where common last names appear in unrelated context.
   *
   * Use strictMode=true for body text; leave false (default) for short
   * title-only strings where false positives are less likely.
   */
  strictMode?: boolean
}

const STRICT_ALIAS_TYPES = new Set(['full_name', 'first_last_initial', 'nickname'])

/**
 * Scan text for player name mentions and return matched player IDs.
 *
 * @param text - raw article/tweet/transcript text
 * @param aliases - flattened alias lookup from the DB (PlayerAlias rows)
 * @param options - optional config (strictMode: skip last_name/abbreviation aliases)
 * @returns deduplicated list of matched player IDs with snippet positions
 *
 * Notes:
 * - Longer aliases take precedence (prevents "Mahomes" shadowing "Patrick Mahomes")
 * - Case-insensitive matching
 * - Each player ID is returned at most once (first match position)
 */
export function resolvePlayerMentions(text: string, aliases: AliasLookup[], options: ResolveOptions = {}): PlayerMatch[] {
  if (!text || !aliases.length) return []

  const { strictMode = false } = options
  const lower = text.toLowerCase()

  // Filter aliases by type when strictMode is on
  const eligible = strictMode
    ? aliases.filter((a) => STRICT_ALIAS_TYPES.has(a.aliasType))
    : aliases

  // Sort aliases by length descending so longer matches win
  const sorted = [...eligible].sort((a, b) => b.alias.length - a.alias.length)

  const matched = new Map<string, PlayerMatch>()

  for (const { alias, playerId } of sorted) {
    // Minimum length: 6 chars in default mode, 8 in strict mode (avoids "Ed Reed", etc.)
    const minLen = strictMode ? 8 : 6
    if (alias.length < minLen) continue

    // Already matched this player
    if (matched.has(playerId)) continue

    const aliasLower = alias.toLowerCase()
    const idx = lower.indexOf(aliasLower)

    if (idx === -1) continue

    // Word boundary check: the character before and after should not be a word char
    const charBefore = idx > 0 ? lower[idx - 1] : ' '
    const charAfter = idx + aliasLower.length < lower.length ? lower[idx + aliasLower.length] : ' '

    const isWordBoundaryBefore = !/\w/.test(charBefore ?? '')
    const isWordBoundaryAfter = !/\w/.test(charAfter ?? '')

    if (!isWordBoundaryBefore || !isWordBoundaryAfter) continue

    matched.set(playerId, {
      playerId,
      alias,
      startIndex: idx,
      endIndex: idx + aliasLower.length,
    })
  }

  return Array.from(matched.values())
}

/**
 * Extract a short snippet from text around a match position.
 * Returns ~150 chars of context centered on the match.
 */
export function extractSnippet(text: string, match: PlayerMatch, windowSize = 150): string {
  const half = Math.floor(windowSize / 2)
  const start = Math.max(0, match.startIndex - half)
  const end = Math.min(text.length, match.endIndex + half)

  let snippet = text.slice(start, end).trim()

  // Add ellipsis if truncated
  if (start > 0) snippet = `...${snippet}`
  if (end < text.length) snippet = `${snippet}...`

  return snippet
}

/**
 * Infer a mention context type from the surrounding text.
 * Returns one of the standard context tags used in ContentPlayerMention.
 */
export function inferMentionContext(snippet: string): string {
  const s = snippet.toLowerCase()

  if (/injur|hurt|knee|hamstring|ankle|questionable|doubtful|out\b|ir\b|placed on/.test(s))
    return 'injury_update'
  if (/trade|traded|trading|deal|acquire|acquired/.test(s)) return 'trade_rumor'
  if (/start|lineup|flex|sit\b|bench|must.?start|plug.?in/.test(s)) return 'start_recommendation'
  if (/break.?out|emerge|uptick|target share|snap count|usage|role/.test(s))
    return 'breakout_candidate'
  if (/depth chart|promoted|demoted|starter|backup|rb1|wr1|qb1/.test(s)) return 'depth_chart_change'
  if (/waiver|stream|pickup|add\b|drop\b/.test(s)) return 'waiver_wire'

  return 'general'
}
