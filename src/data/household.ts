import type { BalanceKey, BalanceRow } from '../types'

export const APP_NAME = 'Reagan Trip Scout'
export const HOUSEHOLD = 'Robert & Rhonda Reagan'
export const TRAVELERS = ['Robert Reagan', 'Rhonda Reagan'] as const
export const COS_EMAIL = 'bobbyreagan75@hotmail.com'
export const DEMO_PASSPHRASE = 'scout2026'

export const AIRPORTS = {
  domesticHome: 'ORF',
  internationalPosition: 'IAD',
  alsoOkGateways: ['JFK', 'EWR', 'BOS', 'ATL', 'ORD', 'MIA'],
} as const

export const CASH_CEILINGS_PER_HOUR = {
  coach: 30,
  premium_economy: 60,
  business_or_first: 90,
} as const

export const MIN_CPP = 0.02
export const LUXURY_CPP_TARGET = { min: 0.1, max: 0.25 } as const
export const EMERGENCY_STASH_PER_TRAVELER = 50_000
export const DEFAULT_TRIP_LENGTH = 12
export const DEFAULT_PARTY = 2

export const POLICY = {
  dealFirst:
    'Hunt the deal first. The city is the souvenir, not the starting gun. Luxury in the cabin and the room is the point.',
  domesticCash:
    'Inside the United States, flights are cash. Points stay parked for long-haul luxury.',
  pointsLane:
    'Points are for international luxury — flights and Hyatt rooms — not for nickel-and-dime redemptions.',
  minCpp:
    'A point has to beat 2¢ or it stays in the account. A great luxury redemption lands closer to 10–25¢.',
  never:
    'Never burn flexible points on gift cards, statement credits, shopping portals, car rentals, or cruises.',
  cashCeilings:
    'Cash ceiling per airborne hour, one-way: $30 coach, $60 premium economy, $90 business or first. Round-trip doubles that. Hours are nonstop block time.',
  mockBook:
    'Mock-book the award and see the seats, names, and taxes before a single point moves. Transfers are 1:1 only.',
  amexBeforeBilt:
    'When Amex Membership Rewards and Bilt both reach the same airline, spend Amex first. Keep Bilt for Hyatt and partners Amex cannot reach.',
  airports:
    'Home field is ORF for domestic hops. Position through IAD for international, with JFK, EWR, BOS, ATL, ORD, and MIA as backups.',
  schedule:
    'Late departures are fine. If two itineraries look similar, skip the dawn push.',
  calendar:
    'Skip U.S. summer when the calendar allows. Most trips run 10–14 nights.',
  stash:
    'Leave about 50,000 points per traveler in reserve — a rainy-day stash, not a spending target.',
  lodging:
    'Hyatt Globalist is the house default. Plan on Hyatt for nearly every stay (~98%).',
  earning:
    'Earn from natural spend and fair deals. No manufactured spend. Rakuten pays out as Amex Membership Rewards.',
  dealGate:
    'No cash-vs-points decision and no transfer until the Deal Score clears. PASS, MARGINAL, or FAIL — with the numbers on the table.',
} as const

export const MOCK_BOOK_ITEMS = [
  'Search the award on the program site and start a mock booking with both names.',
  'Confirm metal, cabin, dates, seat count, and taxes before anything moves.',
  'Screenshot or hold the PNR. If it cannot be held, keep the browser session open.',
  'Only then transfer 1:1 from the chosen flexible currency.',
  'Book immediately after the transfer posts. Never transfer “just in case.”',
  'Skip any transfer that is not 1:1. Bonus-only or worse ratios are a no.',
] as const

export const NEVER_PASS_CHANNELS = [
  'portal',
  'gift_card',
  'statement_credit',
  'cruise_flexible_points',
] as const

export const SEED_BALANCES: Omit<BalanceRow, 'updatedAt' | 'source'>[] = [
  { key: 'Amex_MR_combined', program: 'Amex Membership Rewards', traveler: 'Combined', amount: 655577 },
  { key: 'Citi_TY', program: 'Citi ThankYou', traveler: 'Combined', amount: 330323 },
  { key: 'Bilt_combined', program: 'Bilt Rewards', traveler: 'Combined', amount: 264616 },
  { key: 'Cap_One', program: 'Capital One Miles', traveler: 'Combined', amount: 102304 },
  { key: 'Chase_UR_deduped', program: 'Chase Ultimate Rewards', traveler: 'Combined (deduped)', amount: 101714 },
  { key: 'JAL_JMB_Rhonda', program: 'JAL Mileage Bank', traveler: 'Rhonda', amount: 240000 },
  { key: 'Hyatt_Rhonda', program: 'World of Hyatt', traveler: 'Rhonda', amount: 50469 },
  { key: 'Delta_Robert', program: 'Delta SkyMiles', traveler: 'Robert', amount: 51936 },
  { key: 'Aeroplan', program: 'Aeroplan', traveler: 'Combined', amount: 800 },
]

export const BALANCE_ORDER: BalanceKey[] = SEED_BALANCES.map((row) => row.key)

export function seedBalanceRows(now = new Date().toISOString()): BalanceRow[] {
  return SEED_BALANCES.map((row) => ({
    ...row,
    source: 'seed' as const,
    updatedAt: now,
  }))
}
