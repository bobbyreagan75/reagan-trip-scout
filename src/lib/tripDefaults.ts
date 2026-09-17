import { AIRPORTS, DEFAULT_PARTY, DEFAULT_TRIP_LENGTH } from '../data/household'
import type { HyattStay, TripDraft, TripPositioning } from '../types'

export function emptyPositioning(): TripPositioning {
  return {
    primary: AIRPORTS.internationalPosition,
    backups: [],
    daypart: 'evening',
  }
}

export function emptyHyattStay(): HyattStay {
  return {
    property: '',
    isHyatt: true,
    rareNonHyatt: false,
    nights: 4,
    category: '',
    pointsPerNight: 0,
    cashPerNight: 0,
    taxesPerNight: 0,
    freeNightCertsUsed: 0,
    clubAwardsUsed: 0,
    suiteUpgradeNote: true,
    clubAccess: true,
    lateCheckout: true,
  }
}

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
    positioning: emptyPositioning(),
    hyattStay: emptyHyattStay(),
    lodgingNotes: '',
    hyattSearch: '',
    step: 'where',
    demoLabel: null,
  }
}

export function flightOrigin(isDomestic: boolean): string {
  return isDomestic ? AIRPORTS.domesticHome : AIRPORTS.internationalPosition
}
