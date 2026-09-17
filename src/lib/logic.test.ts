import { describe, expect, it } from 'vitest'
import { cairoDemoTrip } from '../data/cairoDemo'
import { EARN_CARDS, SEED_BONUSES } from '../data/alerts'
import { MOCK_BOOK_ITEMS, seedBalanceRows } from '../data/household'
import { SEED_JAL_IDEAS } from '../data/jalIdeas'
import { SEED_WATCHES } from '../data/watches'
import { cashCeilingUsd, dollarsPerHour, quoteExceedsCeiling } from './ceilings'
import { cppForQuotes, cppVerdict, centsPerPoint } from './cpp'
import { parseAwardWalletCsv } from './csv'
import { isNeverPassChannel, laneById, mockBookComplete, scoreDeal } from './dealScore'
import { isDomesticUsDestination, resolveDomestic } from './domestic'
import { googleFlightsExploreUrl, googleFlightsSearchUrl } from './googleFlights'
import { scoreHyattStay } from './hyattScore'
import { jalCoverage, jalIdeaCpp, jalPoorValue } from './jal'
import { isEarlyDaypart, orfToGatewayUrl, positioningReady } from './positioning'
import { seatsAeroSearchUrl } from './seatsAero'
import { recommendedTransfer, transferOptions } from './transfers'
import { bonusExpired, bonusLikelyApplies, milesWithBonus } from './alerts'
import { buildTripBrief, humanTripBrief } from './tripBrief'
import { emptyHyattStay } from './tripDefaults'
import { watchAlertText, watchSummary } from './watchlist'

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
    expect(humanTripBrief(brief)).toContain('Positioning')
    expect(brief.positioning.primary).toBe('IAD')
    expect(brief.positioning.backups.length).toBeGreaterThanOrEqual(2)
    expect(brief.appliedBonuses).toEqual([])
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

describe('award watchlist', () => {
  it('seeds EgyptAir JFK–CAI business ≤75k for two in May 2027', () => {
    const seed = SEED_WATCHES[0]
    expect(seed.metal).toBe('EgyptAir')
    expect(seed.origin).toBe('JFK')
    expect(seed.destination).toBe('CAI')
    expect(seed.maxMiles).toBe(75000)
    expect(seed.seatsNeeded).toBe(2)
    expect(seed.windowStart).toContain('2027-05')
    const alert = watchAlertText(seed)
    expect(alert).toContain('EgyptAir')
    expect(alert).toContain('Chief of Staff')
    expect(watchSummary(seed)).toContain('JFK–CAI')
  })
})

describe('Hyatt stay scoring', () => {
  it('fails a non-Hyatt stay and scores certificate-covered nights as PASS', () => {
    const awards = { freeNightCerts: 2, clubAwards: 1 }
    const other = { ...emptyHyattStay(), isHyatt: false, rareNonHyatt: false, nights: 3, pointsPerNight: 12000, cashPerNight: 400 }
    expect(scoreHyattStay(other, awards, 50000).verdict).toBe('FAIL')

    const covered = { ...emptyHyattStay(), nights: 2, freeNightCertsUsed: 2, pointsPerNight: 15000, cashPerNight: 200 }
    const coveredScore = scoreHyattStay(covered, awards, 50000)
    expect(coveredScore.paidNights).toBe(0)
    expect(coveredScore.verdict).toBe('PASS')
  })

  it('fails stay CPP under 2¢ and passes a luxury Hyatt cash-vs-points', () => {
    const awards = { freeNightCerts: 0, clubAwards: 0 }
    const cheap = { ...emptyHyattStay(), pointsPerNight: 25000, cashPerNight: 80, taxesPerNight: 40, nights: 3 }
    expect(scoreHyattStay(cheap, awards, 200000).verdict).toBe('FAIL')

    const luxury = { ...emptyHyattStay(), pointsPerNight: 12000, cashPerNight: 1800, taxesPerNight: 40, nights: 4 }
    const scored = scoreHyattStay(luxury, awards, 200000)
    expect(scored.cpp).toBeGreaterThan(0.1)
    expect(scored.verdict).toBe('PASS')
  })

  it('scores Cairo SAMPLE four nights as MARGINAL CPP with enough points on hand', () => {
    const stay = cairoDemoTrip().hyattStay
    const rhondaHyatt = seedBalanceRows().find((row) => row.key === 'Hyatt_Rhonda')?.amount ?? 0
    const scored = scoreHyattStay(stay, { freeNightCerts: 0, clubAwards: 0 }, rhondaHyatt)
    expect(stay.nights).toBe(4)
    expect(scored.pointsNeeded).toBe(48000)
    expect(scored.enoughPoints).toBe(true)
    expect(scored.cpp).toBeGreaterThan(0.02)
    expect(scored.cpp).toBeLessThan(0.1)
    expect(scored.verdict).toBe('MARGINAL')
  })
})

describe('ORF positioning', () => {
  it('requires at least two backup gateways and flags early hops', () => {
    expect(positioningReady({ primary: 'IAD', backups: ['JFK'], daypart: 'evening' }, false)).toBe(false)
    expect(positioningReady({ primary: 'IAD', backups: ['JFK', 'EWR'], daypart: 'evening' }, false)).toBe(true)
    expect(positioningReady({ primary: 'IAD', backups: [], daypart: 'evening' }, true)).toBe(true)
    expect(isEarlyDaypart('early')).toBe(true)
    expect(isEarlyDaypart('evening')).toBe(false)
    expect(orfToGatewayUrl('JFK')).toContain('ORF')
    expect(orfToGatewayUrl('JFK')).toContain('JFK')
  })
})

describe('JAL stash', () => {
  it('covers two business one-ways from 240k and flags poor CPP', () => {
    const idea = SEED_JAL_IDEAS[0]
    const cover = jalCoverage(240000, idea.milesPerPerson, 2)
    expect(cover.enough).toBe(true)
    expect(cover.need).toBe(130000)
    expect(jalIdeaCpp(idea).cpp).toBeGreaterThan(0.02)
    const junk = { ...idea, milesPerPerson: 80000, cashCompUsd: 200, taxesUsd: 50 }
    expect(jalPoorValue(junk)).toBe(true)
  })
})

describe('this week alerts', () => {
  it('matches SAMPLE Amex → Aeroplan to the Cairo award', () => {
    const amexAeroplan = SEED_BONUSES.find((row) => row.partner === 'Aeroplan')
    expect(amexAeroplan).toBeTruthy()
    const award = cairoDemoTrip().awardQuotes[0]
    expect(bonusLikelyApplies(amexAeroplan!, award.program, 'Amex Membership Rewards')).toBe(true)
    expect(bonusLikelyApplies(amexAeroplan!, 'World of Hyatt', 'Amex Membership Rewards')).toBe(false)
    expect(milesWithBonus(176000, 30)).toBe(228800)
  })

  it('covers household earn cards and a Flex category placeholder', () => {
    expect(EARN_CARDS.map((card) => card.id)).toEqual([
      'bilt', 'amex-gold', 'amex-plat', 'csr', 'flex', 'unlimited', 'ink',
    ])
    expect(EARN_CARDS.find((card) => card.id === 'flex')?.flexPlaceholder).toBe(true)
    expect(bonusExpired({ ...SEED_BONUSES[0], endDate: '2020-01-01' })).toBe(true)
  })

  it('lists applied bonuses on the trip brief', () => {
    const seed = SEED_BONUSES[0]
    const trip = { ...cairoDemoTrip(), appliedBonusIds: [seed.id] }
    const brief = buildTripBrief(trip, seedBalanceRows(), 'Robert Reagan', undefined, SEED_BONUSES)
    expect(brief.appliedBonuses[0]).toMatch(/Aeroplan/)
    expect(humanTripBrief(brief)).toContain('Transfer bonuses marked for this trip')
  })
})
