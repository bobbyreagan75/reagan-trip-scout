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

export function billableHours(hoursOneWay: number, roundTrip: boolean): number {
  return roundTrip ? hoursOneWay * 2 : hoursOneWay
}

export function dollarsPerHour(cashUsd: number, hoursOneWay: number, roundTrip: boolean): number | null {
  if (!hoursOneWay || hoursOneWay <= 0) return null
  return cashUsd / billableHours(hoursOneWay, roundTrip)
}

export function dollarsPerHourForQuote(quote: CashQuote): number | null {
  return dollarsPerHour(quote.cashUsd, quote.hoursOneWay, Boolean(quote.returnDate))
}
