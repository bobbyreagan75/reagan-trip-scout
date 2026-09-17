import { LUXURY_CPP_TARGET, MIN_CPP } from '../data/household'
import type { AwardQuote, CashQuote } from '../types'

export function centsPerPoint(cashUsd: number, miles: number, taxesUsd = 0): number | null {
  if (!miles || miles <= 0) return null
  return (cashUsd - taxesUsd) / miles
}

export function partyAwardCost(quote: AwardQuote, partySize: number): { miles: number; taxesUsd: number } {
  return {
    miles: quote.miles * partySize,
    taxesUsd: quote.taxesUsd * partySize,
  }
}

export function partyCashCost(quote: CashQuote, partySize: number): number {
  return quote.cashUsd * partySize
}

export function cppForQuotes(cash: CashQuote, award: AwardQuote, partySize: number): number | null {
  const cashTotal = partyCashCost(cash, partySize)
  const awardCost = partyAwardCost(award, partySize)
  return centsPerPoint(cashTotal, awardCost.miles, awardCost.taxesUsd)
}

export function cppVerdict(cpp: number | null): 'below' | 'ok' | 'luxury' | 'unknown' {
  if (cpp === null) return 'unknown'
  if (cpp < MIN_CPP) return 'below'
  if (cpp >= LUXURY_CPP_TARGET.min && cpp <= LUXURY_CPP_TARGET.max) return 'luxury'
  if (cpp > LUXURY_CPP_TARGET.max) return 'luxury'
  return 'ok'
}

export function formatCpp(cpp: number | null): string {
  if (cpp === null) return '—'
  return `${(cpp * 100).toFixed(2)}¢`
}
