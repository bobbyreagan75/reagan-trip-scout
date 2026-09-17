import { describe, expect, it } from 'vitest'
import { cairoDemoTrip } from '../data/cairoDemo'
import { MOCK_BOOK_ITEMS, seedBalanceRows } from '../data/household'
import { cashCeilingUsd, dollarsPerHour, quoteExceedsCeiling } from './ceilings'
import { cppForQuotes, cppVerdict, centsPerPoint } from './cpp'
import { parseAwardWalletCsv } from './csv'
import { isNeverPassChannel, laneById, mockBookComplete, scoreDeal } from './dealScore'
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
    expect(brief.dealScore.overall).toBe('MARGINAL')
    expect(humanTripBrief(brief)).toContain('Cairo')
    expect(humanTripBrief(brief)).toContain('SAMPLE')
    expect(humanTripBrief(brief)).toContain('Hyatt')
    expect(humanTripBrief(brief)).toContain('Deal Score')
  })
})

describe('deal score gate', () => {
  it('scores Cairo SAMPLE cash as FAIL and points as MARGINAL', () => {
    const trip = cairoDemoTrip()
    const score = scoreDeal(trip, seedBalanceRows())
    const cash = laneById(score, 'cash')
    const points = laneById(score, 'points')
    expect(cash?.verdict).toBe('FAIL')
    expect(cash?.allowed).toBe(false)
    expect(points?.verdict).toBe('MARGINAL')
    expect(points?.allowed).toBe(true)
    expect(score.overall).toBe('MARGINAL')
    expect(score.recommended).toBe('points')
    expect(score.canProceedToPay).toBe(true)
    expect(score.canBookPoints).toBe(false)
    const hourly = cash?.checks.find((c) => c.id === 'cash_hourly')
    expect(hourly?.numbers.ceilingPerHour).toContain('90')
    expect(points?.checks.find((c) => c.id === 'cpp')?.numbers.cpp).toContain('7.08')
  })

  it('fails portal / gift card / statement credit / cruise redemptions', () => {
    const trip = cairoDemoTrip()
    for (const channel of ['portal', 'gift_card', 'statement_credit', 'cruise_flexible_points'] as const) {
      const score = scoreDeal({ ...trip, redemptionChannel: channel }, seedBalanceRows())
      expect(isNeverPassChannel(channel)).toBe(true)
      expect(score.overall).toBe('FAIL')
      expect(score.canProceedToPay).toBe(false)
    }
  })

  it('fails domestic points even when an award is pasted', () => {
    const trip = cairoDemoTrip()
    const score = scoreDeal({ ...trip, isDomestic: true }, seedBalanceRows())
    const points = laneById(score, 'points')
    expect(points?.verdict).toBe('FAIL')
    expect(points?.allowed).toBe(false)
    expect(points?.headline).toMatch(/domestic/i)
  })

  it('fails points under 2¢ and passes luxury-range CPP', () => {
    const trip = cairoDemoTrip()
    const cheap = {
      ...trip,
      cashQuotes: [{ ...trip.cashQuotes[0], cashUsd: 400 }],
    }
    const cheapScore = scoreDeal(cheap, seedBalanceRows())
    expect(laneById(cheapScore, 'points')?.verdict).toBe('FAIL')
    expect(laneById(cheapScore, 'cash')?.verdict).toBe('PASS')
    expect(cheapScore.recommended).toBe('cash')

    const luxury = {
      ...trip,
      cashQuotes: [{ ...trip.cashQuotes[0], cashUsd: 22000 }],
    }
    const luxuryScore = scoreDeal(luxury, seedBalanceRows())
    expect(laneById(luxuryScore, 'points')?.verdict).toBe('PASS')
    expect(luxuryScore.recommended).toBe('points')
  })

  it('requires mock-book before a points transfer can book', () => {
    const trip = cairoDemoTrip()
    expect(mockBookComplete(trip.mockBookChecks)).toBe(false)
    const done = cairoDemoTrip()
    done.mockBookChecks = MOCK_BOOK_ITEMS.map(() => true)
    const score = scoreDeal(done, seedBalanceRows())
    expect(score.canBookPoints).toBe(true)
  })

  it('passes a domestic cash fare inside the hourly ceiling', () => {
    const trip = cairoDemoTrip()
    const domestic = {
      ...trip,
      isDomestic: true,
      destination: 'Denver, CO',
      awardQuotes: [],
      selectedAwardId: null,
      cashQuotes: [{
        ...trip.cashQuotes[0],
        airline: 'United',
        origin: 'ORF',
        destination: 'DEN',
        cabin: 'coach' as const,
        cashUsd: 50,
        hoursOneWay: 2,
        returnDate: '',
        sample: false,
      }],
    }
    const score = scoreDeal(domestic, seedBalanceRows())
    expect(laneById(score, 'cash')?.verdict).toBe('PASS')
    expect(laneById(score, 'points')?.verdict).toBe('FAIL')
    expect(score.canProceedToPay).toBe(true)
    expect(score.recommended).toBe('cash')
    expect(dollarsPerHour(50, 2, false)).toBe(25)
  })
})
