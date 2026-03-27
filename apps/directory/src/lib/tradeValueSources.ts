/**
 * DB `PlayerTradeValue.source` keys → human-readable labels.
 * Data often flows through Dynasty Daddy’s API, but each row is still a distinct market index.
 */
export const TRADE_VALUE_SOURCE_ORDER = [
  'ktc',
  'fantasycalc',
  'dynastyprocess',
  'dynastysuperflex',
  'dynastydaddy',
] as const

export type TradeValueSourceKey = (typeof TRADE_VALUE_SOURCE_ORDER)[number] | string

export function getTradeValueSourceLabel(source: string): { title: string; subtitle?: string } {
  const s = source.toLowerCase()
  switch (s) {
    case 'ktc':
      return { title: 'KeepTradeCut', subtitle: 'Dynasty market (KTC)' }
    case 'fantasycalc':
      return { title: 'FantasyCalc', subtitle: 'Multi-format trade chart' }
    case 'dynastyprocess':
      return { title: 'Dynasty Process', subtitle: 'Dynasty value index' }
    case 'dynastysuperflex':
      return { title: 'Dynasty Superflex', subtitle: 'SF-focused index' }
    case 'dynastydaddy':
      return { title: 'Dynasty Daddy', subtitle: 'DD daily aggregate' }
    default:
      return { title: source.replace(/_/g, ' '), subtitle: undefined }
  }
}

export function sortTradeValueRows<T extends { source: string }>(rows: T[]): T[] {
  const idx = (s: string) => {
    const i = TRADE_VALUE_SOURCE_ORDER.indexOf(s as (typeof TRADE_VALUE_SOURCE_ORDER)[number])
    return i === -1 ? 999 : i
  }
  return [...rows].sort((a, b) => idx(a.source) - idx(b.source))
}
