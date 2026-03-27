import { db } from '@rzf/db'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlayerMarketValues {
  ktc: { dynasty1qb: number | null; dynastySf: number | null; redraft: number | null; trend30d: number | null } | null
  fantasycalc: { dynasty1qb: number | null; dynastySf: number | null; redraft: number | null; trend30d: number | null } | null
  dynastyprocess: { dynasty1qb: number | null; dynastySf: number | null; trend30d: number | null } | null
  dynastysuperflex: { dynasty1qb: number | null; dynastySf: number | null; trend30d: number | null } | null
  dynastydaddy: { dynasty1qb: number | null; dynastySf: number | null; redraft: number | null; trend30d: number | null } | null
}

export type MultiMarketMap = Map<string, PlayerMarketValues>

// ─── Core Query ───────────────────────────────────────────────────────────────

/**
 * Fetch trade value markets (KTC, FantasyCalc, Dynasty Process, Dynasty Superflex,
 * Dynasty Daddy) for a set of players in a single DB query.
 *
 * Returns a Map<sleeperId, PlayerMarketValues>. Every requested ID is present
 * in the map — missing markets are null, not absent.
 */
export async function getMultiMarketValues(playerIds: string[]): Promise<MultiMarketMap> {
  if (playerIds.length === 0) return new Map()

  const rows = await db.playerTradeValue.findMany({
    where: {
      sleeperId: { in: playerIds },
      source: { in: ['ktc', 'fantasycalc', 'dynastyprocess', 'dynastysuperflex', 'dynastydaddy'] },
    },
    select: {
      sleeperId: true,
      source: true,
      dynasty1qb: true,
      dynastySf: true,
      redraft: true,
      trend30d: true,
    },
  })

  const result = new Map<string, PlayerMarketValues>()
  for (const id of playerIds) {
    result.set(id, {
      ktc: null,
      fantasycalc: null,
      dynastyprocess: null,
      dynastysuperflex: null,
      dynastydaddy: null,
    })
  }

  for (const row of rows) {
    const entry = result.get(row.sleeperId)
    if (!entry) continue

    const base = { dynasty1qb: row.dynasty1qb, dynastySf: row.dynastySf, trend30d: row.trend30d }

    if (row.source === 'ktc') {
      entry.ktc = { ...base, redraft: row.redraft }
    } else if (row.source === 'fantasycalc') {
      entry.fantasycalc = { ...base, redraft: row.redraft }
    } else if (row.source === 'dynastyprocess') {
      entry.dynastyprocess = base
    } else if (row.source === 'dynastysuperflex') {
      entry.dynastysuperflex = base
    } else if (row.source === 'dynastydaddy') {
      entry.dynastydaddy = { ...base, redraft: row.redraft }
    }
  }

  return result
}

// ─── Prompt Formatting ────────────────────────────────────────────────────────

/**
 * Format all four market values for a player into a prompt block.
 * KTC is the anchor; other markets appear alongside for cross-reference.
 * leagueStyle controls whether dynasty or redraft values are shown as primary.
 */
export function formatMarketValuesForPrompt(
  name: string,
  values: PlayerMarketValues,
  leagueStyle: 'dynasty' | 'redraft' = 'dynasty',
): string {
  const lines: string[] = [`  ${name} — Market Values:`]
  const hasAny =
    values.ktc ||
    values.fantasycalc ||
    values.dynastyprocess ||
    values.dynastysuperflex ||
    values.dynastydaddy

  if (!hasAny) {
    lines.push('    No market values available')
    return lines.join('\n')
  }

  if (values.ktc) {
    const primary = leagueStyle === 'redraft' ? values.ktc.redraft : values.ktc.dynasty1qb
    const trendStr = values.ktc.trend30d != null
      ? ` trend30d: ${values.ktc.trend30d > 0 ? '+' : ''}${values.ktc.trend30d}`
      : ''
    const sfStr = values.ktc.dynastySf != null ? ` | SF: ${values.ktc.dynastySf}` : ''
    lines.push(`    KTC: ${primary ?? 'N/A'}${sfStr}${trendStr}`)
  }

  if (values.fantasycalc) {
    const primary = leagueStyle === 'redraft' ? values.fantasycalc.redraft : values.fantasycalc.dynasty1qb
    const sfStr = values.fantasycalc.dynastySf != null ? ` | SF: ${values.fantasycalc.dynastySf}` : ''
    lines.push(`    FantasyCalc: ${primary ?? 'N/A'}${sfStr}`)
  }

  if (values.dynastyprocess) {
    const sfStr = values.dynastyprocess.dynastySf != null ? ` | SF: ${values.dynastyprocess.dynastySf}` : ''
    lines.push(`    Dynasty Process: ${values.dynastyprocess.dynasty1qb ?? 'N/A'}${sfStr}`)
  }

  if (values.dynastysuperflex) {
    const sfStr = values.dynastysuperflex.dynastySf != null ? ` | SF: ${values.dynastysuperflex.dynastySf}` : ''
    lines.push(`    Dynasty Superflex: ${values.dynastysuperflex.dynasty1qb ?? 'N/A'}${sfStr}`)
  }

  if (values.dynastydaddy) {
    const primary = leagueStyle === 'redraft' ? values.dynastydaddy.redraft : values.dynastydaddy.dynasty1qb
    const sfStr = values.dynastydaddy.dynastySf != null ? ` | SF: ${values.dynastydaddy.dynastySf}` : ''
    lines.push(`    Dynasty Daddy: ${primary ?? 'N/A'}${sfStr}`)
  }

  return lines.join('\n')
}

// ─── Value Helpers ────────────────────────────────────────────────────────────

/**
 * Get the single best available value for a player.
 * KTC is the anchor; falls back through FantasyCalc → Dynasty Process → Dynasty Superflex.
 */
export function getAnchorValue(
  values: PlayerMarketValues,
  leagueStyle: 'dynasty' | 'redraft' = 'dynasty',
): number | null {
  if (leagueStyle === 'redraft') {
    return values.ktc?.redraft ?? values.fantasycalc?.redraft ?? null
  }
  return (
    values.ktc?.dynasty1qb ??
    values.fantasycalc?.dynasty1qb ??
    values.dynastyprocess?.dynasty1qb ??
    values.dynastysuperflex?.dynasty1qb ??
    values.dynastydaddy?.dynasty1qb ??
    null
  )
}

/** Get the 30-day trend from the most reliable available source. */
export function getAnchorTrend(values: PlayerMarketValues): number | null {
  return values.ktc?.trend30d ?? values.fantasycalc?.trend30d ?? null
}

/** Classify trend direction from the 30d delta. */
export function classifyTrend(trend30d: number | null): 'rising' | 'falling' | 'stable' | 'unknown' {
  if (trend30d == null) return 'unknown'
  if (trend30d > 50) return 'rising'
  if (trend30d < -50) return 'falling'
  return 'stable'
}
