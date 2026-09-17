import { AIRPORTS, DEFAULT_PARTY, DEFAULT_TRIP_LENGTH } from './household'
import type { AwardQuote, CashQuote, TripDraft } from '../types'

export const CAIRO_DEMO_LABEL = 'Cairo demo · SAMPLE figures'

function quoteId(prefix: string): string {
  return `${prefix}-cairo-demo`
}

export function cairoCashQuote(): CashQuote {
  return {
    id: quoteId('cash'),
    sample: true,
    airline: 'EgyptAir (SAMPLE cash fare)',
    origin: AIRPORTS.internationalPosition,
    destination: 'CAI',
    depart: '2026-11-10',
    returnDate: '2026-11-22',
    cabin: 'business_or_first',
    cashUsd: 6420,
    hoursOneWay: 11,
    notes: 'SAMPLE placeholder — paste a real Google Flights total when you have one. Round-trip, per person, business.',
  }
}

export function cairoAwardQuote(): AwardQuote {
  return {
    id: quoteId('award'),
    sample: true,
    program: 'Aeroplan',
    metal: 'EgyptAir',
    origin: AIRPORTS.internationalPosition,
    destination: 'CAI',
    depart: '2026-11-10',
    returnDate: '2026-11-22',
    cabin: 'business_or_first',
    miles: 88000,
    taxesUsd: 187.5,
    seats: 2,
    notes: 'SAMPLE Aeroplan-style placeholder for EgyptAir metal. Edit freely. Not live availability.',
  }
}

export function cairoDemoTrip(): TripDraft {
  const cash = cairoCashQuote()
  const award = cairoAwardQuote()
  return {
    destinationMode: 'specific',
    destination: 'Cairo, Egypt',
    isDomestic: false,
    domesticOverride: false,
    timeframe: {
      flexible: true,
      startDate: '2026-11-10',
      endDate: '2026-11-22',
      plusMinusDays: 3,
      tripLengthDays: DEFAULT_TRIP_LENGTH,
    },
    constraints: {
      partySize: DEFAULT_PARTY,
      cabin: 'business_or_first',
      dislikeEarly: true,
      lateOk: true,
    },
    cashQuotes: [cash],
    awardQuotes: [award],
    selectedCashId: cash.id,
    selectedAwardId: award.id,
    payWith: null,
    chosenTransferKey: null,
    redemptionChannel: 'airline_or_program',
    mockBookChecks: [],
    positioning: {
      primary: AIRPORTS.internationalPosition,
      backups: ['JFK', 'EWR', 'BOS'],
      daypart: 'evening',
    },
    hyattStay: {
      property: 'Grand Hyatt Cairo (SAMPLE)',
      isHyatt: true,
      rareNonHyatt: false,
      nights: 4,
      category: 'Cat 2-ish / edit me',
      pointsPerNight: 12000,
      cashPerNight: 280,
      taxesPerNight: 35,
      freeNightCertsUsed: 0,
      clubAwardsUsed: 0,
      suiteUpgradeNote: true,
      clubAccess: true,
      lateCheckout: true,
    },
    lodgingNotes: 'Hyatt Globalist default — look at Grand Hyatt Cairo or Andaz if dates line up.',
    hyattSearch: 'Cairo, Egypt',
    step: 'verify',
    demoLabel: CAIRO_DEMO_LABEL,
    appliedBonusIds: [],
  }
}
