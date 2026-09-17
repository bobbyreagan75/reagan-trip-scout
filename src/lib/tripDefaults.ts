import { AIRPORTS, DEFAULT_PARTY, DEFAULT_TRIP_LENGTH } from '../data/household'
import type { TripDraft } from '../types'

export function emptyTrip(): TripDraft {
  return {
    destinationMode: 'specific',
    destination: '',
    isDomestic: false,
    domesticOverride: false,
    timeframe: {
      flexible: true,
      startDate: '',
      endDate: '',
      plusMinusDays: 3,
      tripLengthDays: DEFAULT_TRIP_LENGTH,
    },
    constraints: {
      partySize: DEFAULT_PARTY,
      cabin: 'business_or_first',
      dislikeEarly: true,
      lateOk: true,
    },
    cashQuotes: [],
    awardQuotes: [],
    selectedCashId: null,
    selectedAwardId: null,
    payWith: null,
    chosenTransferKey: null,
    redemptionChannel: null,
    mockBookChecks: [],
    lodgingNotes: '',
    hyattSearch: '',
    step: 'where',
    demoLabel: null,
  }
}

export function flightOrigin(isDomestic: boolean): string {
  return isDomestic ? AIRPORTS.domesticHome : AIRPORTS.internationalPosition
}
