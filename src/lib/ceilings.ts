import { CASH_CEILINGS_PER_HOUR } from '../data/household'
import type { Cabin, CashQuote } from '../types'

export function cashCeilingUsd(cabin: Cabin, hoursOneWay: number, roundTrip: boolean): number {
  const rate = CASH_CEILINGS_PER_HOUR[cabin]
  const oneWay = rate * hoursOneWay
  return roundTrip ? oneWay * 2 : oneWay
}

export function quoteExceedsCeiling(quote: CashQuote): boolean {
  if (!quote.hoursOneWay) return false
  const roundTrip = Boolean(quote.returnDate)
  const ceiling = cashCeilingUsd(quote.cabin, quote.hoursOneWay, roundTrip)
  return quote.cashUsd > ceiling
}

export function ceilingForQuote(quote: CashQuote): number | null {
  if (!quote.hoursOneWay) return null
  return cashCeilingUsd(quote.cabin, quote.hoursOneWay, Boolean(quote.returnDate))
}
