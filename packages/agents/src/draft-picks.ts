// ─── Types ────────────────────────────────────────────────────────────────────

export interface DraftPick {
  type: 'current' | 'future'
  round: number
  /** For future picks — approximate round position */
  qualifier?: 'early' | 'mid' | 'late'
  /** Season year */
  year: number
  /** Team whose pick this is */
  teamAbbr?: string
  /** Human-readable label */
  display?: string
}

// ─── Serialization ────────────────────────────────────────────────────────────

/** Encode a DraftPick as a string ID safe for use in giving/receiving arrays. */
export function makeDraftPickId(pick: DraftPick): string {
  return `pick:${pick.year}:${pick.round}:${pick.qualifier ?? ''}:${pick.teamAbbr ?? ''}`
}

/** Returns true if the given ID string represents a draft pick (not a player). */
export function isDraftPick(id: string): boolean {
  return id.startsWith('pick:')
}

/** Parse a draft pick ID back into a DraftPick object. Returns null on invalid input. */
export function parseDraftPickId(id: string): DraftPick | null {
  try {
    const parts = id.split(':')
    if (parts[0] !== 'pick' || parts.length < 4) return null
    const year = parseInt(parts[1] ?? '', 10)
    const round = parseInt(parts[2] ?? '', 10)
    if (isNaN(year) || isNaN(round)) return null

    const qualifier = (parts[3] || undefined) as DraftPick['qualifier']
    const teamAbbr = parts[4] || undefined
    const currentYear = new Date().getFullYear()

    const pick: DraftPick = {
      type: year <= currentYear ? 'current' : 'future',
      round,
      qualifier,
      year,
      teamAbbr,
    }
    pick.display = formatDraftPick(pick)
    return pick
  } catch {
    return null
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th')
}

export function formatDraftPick(pick: DraftPick): string {
  const qualifier = pick.qualifier ? ` (${pick.qualifier})` : ''
  const team = pick.teamAbbr ? ` [${pick.teamAbbr}]` : ''
  return `${pick.year} ${ordinal(pick.round)}-round pick${qualifier}${team}`
}

// ─── Value Estimation ─────────────────────────────────────────────────────────
//
// Approximate KTC-style dynasty values until a live draft pick value endpoint
// is available (KTC picks API / Dynasty Daddy / FantasyPros — research pending).
//
// Research task: check Dynasty Daddy open-source repo, KTC, and FantasyPros
// for usable draft pick value endpoints. Update this table when found.

const PICK_VALUE_ESTIMATES: Record<string, number> = {
  // Current-year picks
  'current:1:early': 9000,
  'current:1:mid': 7500,
  'current:1:late': 5500,
  'current:2:early': 3000,
  'current:2:mid': 2000,
  'current:2:late': 1200,
  'current:3:early': 700,
  'current:3:mid': 500,
  'current:3:late': 300,
  // 1 year out
  'future1:1:early': 6000,
  'future1:1:mid': 4500,
  'future1:1:late': 3200,
  'future1:2:early': 1800,
  'future1:2:mid': 1200,
  'future1:2:late': 800,
  'future1:3:early': 450,
  'future1:3:mid': 300,
  // 2+ years out (heavily discounted for uncertainty)
  'future2:1:early': 3500,
  'future2:1:mid': 2500,
  'future2:1:late': 1800,
  'future2:2': 800,
  'future3:1': 2000,
}

/**
 * Return an estimated dynasty value for a draft pick.
 * Returns null for past picks or unknown combinations.
 */
export function estimateDraftPickValue(pick: DraftPick): number | null {
  const currentYear = new Date().getFullYear()
  const yearsOut = pick.year - currentYear

  if (yearsOut < 0) return null

  const prefix = yearsOut === 0 ? 'current' : `future${yearsOut}`
  const qualifierStr = pick.qualifier ? `:${pick.qualifier}` : ''

  // Try with qualifier first, then without
  return (
    PICK_VALUE_ESTIMATES[`${prefix}:${pick.round}${qualifierStr}`] ??
    PICK_VALUE_ESTIMATES[`${prefix}:${pick.round}`] ??
    null
  )
}

/** Format a draft pick for LLM prompt injection. */
export function formatDraftPickForPrompt(pick: DraftPick): string {
  const value = estimateDraftPickValue(pick)
  const valueStr = value != null ? ` (~${value} dynasty value, estimated)` : ' (value unknown)'
  return `  ${formatDraftPick(pick)}${valueStr}`
}
