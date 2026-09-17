import { describe, expect, it } from 'vitest'
import { cairoDemoTrip } from '../data/cairoDemo'
import { seedBalanceRows } from '../data/household'
import { cashCeilingUsd, quoteExceedsCeiling } from './ceilings'
import { cppForQuotes, cppVerdict, centsPerPoint } from './cpp'
import { parseAwardWalletCsv } from './csv'
import { isDomesticUsDestination, resolveDomestic } from './domestic'
import { googleFlightsExploreUrl, googleFlightsSearchUrl } from './googleFlights'
import { seatsAeroSearchUrl } from './seatsAero'
import { recommendedTransfer, transferOptions } from './transfers'
import { buildTripBrief, humanTripBrief } from './tripBrief'

describe('cpp', () => {
  it('computes cents per point net of taxes', () => {
    expect(centsPerPoint(8000, 160000, 400)).toBeCloseTo(0.0475)
  })

  it('flags below the 2¢ household floor', () => {
    expect(cppVerdict(0.015)).toBe('below')
    expect(cppVerdict(0.04)).toBe('ok')
    expect(cppVerdict(0.12)).toBe('luxury')
  })
})

describe('ceilings', () => {
  it('doubles the hourly cap for round-trip', () => {
    expect(cashCeilingUsd('business_or_first', 11, true)).toBe(1980)
    expect(cashCeilingUsd('coach', 2, false)).toBe(60)
  })

  it('marks the Cairo sample cash fare over ceiling', () => {
    const trip = cairoDemoTrip()
    expect(quoteExceedsCeiling(trip.cashQuotes[0])).toBe(true)
  })
})

describe('domestic detection', () => {
  it('treats Norfolk and US airport codes as domestic', () => {
    expect(isDomesticUsDestination('Norfolk, VA')).toBe(true)
    expect(isDomesticUsDestination('ORF')).toBe(true)
    expect(isDomesticUsDestination('Denver, CO')).toBe(true)
  })

  it('treats Cairo as international and deal-first as not domestic', () => {
    expect(isDomesticUsDestination('Cairo, Egypt')).toBe(false)
    expect(resolveDomestic('Denver, CO', 'deal_first')).toBe(false)
    expect(resolveDomestic('Paris, France', 'specific')).toBe(false)
  })
})

describe('deep links', () => {
  it('builds Google Flights and seats.aero URLs', () => {
    const gf = googleFlightsSearchUrl({
      origin: 'IAD',
      destination: 'CAI',
      startDate: '2026-11-10',
      endDate: '2026-11-22',
      cabin: 'business_or_first',
      partySize: 2,
    })
    expect(gf).toContain('google.com/travel/flights')
    expect(gf).toContain('IAD')
    expect(gf).toContain('CAI')
    expect(googleFlightsExploreUrl('IAD')).toContain('travel/explore')
    const seats = seatsAeroSearchUrl({ origin: 'IAD', destination: 'CAI', cabin: 'business_or_first' })
    expect(seats).toContain('seats.aero')
    expect(seats).toContain('IAD')
    expect(seats).toContain('CAI')
  })
})

describe('transfers', () => {
  it('prefers Amex Membership Rewards over Bilt for Aeroplan', () => {
    const trip = cairoDemoTrip()
    const options = transferOptions({
      award: trip.awardQuotes[0],
      balances: seedBalanceRows(),
      partySize: 2,
    })
    const rec = recommendedTransfer(options)
    expect(rec?.currencyKey).toBe('Amex_MR_combined')
    const bilt = options.find((o) => o.currencyKey === 'Bilt_combined')
    expect(bilt?.keepForHyatt).toBe(true)
    expect(options.every((o) => o.ratio === '1:1')).toBe(true)
  })

  it('needs miles for the whole party', () => {
    const trip = cairoDemoTrip()
    const options = transferOptions({
      award: trip.awardQuotes[0],
      balances: seedBalanceRows(),
      partySize: 2,
    })
    expect(options[0].milesNeeded).toBe(176000)
  })
})

describe('awardwallet csv', () => {
  it('parses a program/balance export', () => {
    const csv = `Program,Balance,Traveler\nAeroplan,800,Combined\nWorld of Hyatt,50469,Rhonda`
    const parsed = parseAwardWalletCsv(csv)
    expect(parsed.rows).toHaveLength(2)
    expect(parsed.rows[1].amount).toBe(50469)
  })
})

describe('trip brief', () => {
  it('exports a structured brief and a human summary', () => {
    const trip = cairoDemoTrip()
    const cpp = cppForQuotes(trip.cashQuotes[0], trip.awardQuotes[0], 2)
    expect(cpp).toBeGreaterThan(0.02)
    const brief = buildTripBrief(trip, seedBalanceRows(), 'Robert Reagan')
    expect(brief.destination).toBe('Cairo, Egypt')
    expect(brief.domestic).toBe(false)
    expect(humanTripBrief(brief)).toContain('Cairo')
    expect(humanTripBrief(brief)).toContain('SAMPLE')
    expect(humanTripBrief(brief)).toContain('Hyatt')
  })
})
