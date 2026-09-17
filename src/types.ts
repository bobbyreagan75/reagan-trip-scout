export type TravelerName = 'Robert Reagan' | 'Rhonda Reagan'

export type View = 'home' | 'plan' | 'watch' | 'jal' | 'balances' | 'settings'

export type WizardStep =
  | 'where'
  | 'when'
  | 'constraints'
  | 'position'
  | 'search'
  | 'verify'
  | 'pay'
  | 'lodge'
  | 'brief'

export type Daypart = 'early' | 'morning' | 'afternoon' | 'evening' | 'late'

export type DealVerdict = 'PASS' | 'FAIL' | 'MARGINAL'

export type RedemptionChannel =
  | 'airline_or_program'
  | 'portal'
  | 'gift_card'
  | 'statement_credit'
  | 'cruise_flexible_points'

export type DestinationMode = 'specific' | 'deal_first'

export type Cabin = 'coach' | 'premium_economy' | 'business_or_first'

export type PayWith = 'cash' | 'points'

export type BalanceKey =
  | 'Amex_MR_combined'
  | 'Citi_TY'
  | 'Bilt_combined'
  | 'Cap_One'
  | 'Chase_UR_deduped'
  | 'JAL_JMB_Rhonda'
  | 'Hyatt_Rhonda'
  | 'Delta_Robert'
  | 'Aeroplan'

export type BalanceRow = {
  key: BalanceKey
  program: string
  traveler: string
  amount: number
  source: 'seed' | 'manual' | 'csv'
  updatedAt: string
}

export type Timeframe = {
  flexible: boolean
  startDate: string
  endDate: string
  plusMinusDays: number
  tripLengthDays: number
}

export type Constraints = {
  partySize: number
  cabin: Cabin
  dislikeEarly: boolean
  lateOk: boolean
}

export type CashQuote = {
  id: string
  sample: boolean
  airline: string
  origin: string
  destination: string
  depart: string
  returnDate: string
  cabin: Cabin
  cashUsd: number
  hoursOneWay: number
  notes: string
}

export type AwardQuote = {
  id: string
  sample: boolean
  program: string
  metal: string
  origin: string
  destination: string
  depart: string
  returnDate: string
  cabin: Cabin
  miles: number
  taxesUsd: number
  seats: number
  notes: string
}

export type AwardWatch = {
  id: string
  metal: string
  program: string
  origin: string
  destination: string
  cabin: Cabin
  maxMiles: number
  seatsNeeded: number
  windowStart: string
  windowEnd: string
  notes: string
}

export type TripPositioning = {
  primary: string
  backups: string[]
  daypart: Daypart
}

export type HyattAwards = {
  freeNightCerts: number
  clubAwards: number
}

export type HyattStay = {
  property: string
  isHyatt: boolean
  rareNonHyatt: boolean
  nights: number
  category: string
  pointsPerNight: number
  cashPerNight: number
  taxesPerNight: number
  freeNightCertsUsed: number
  clubAwardsUsed: number
  suiteUpgradeNote: boolean
  clubAccess: boolean
  lateCheckout: boolean
}

export type JalIdea = {
  id: string
  title: string
  region: string
  cabin: Cabin
  milesPerPerson: number
  cashCompUsd: number
  taxesUsd: number
  sample: boolean
  notes: string
}

export type TransferOption = {
  currencyKey: BalanceKey
  currencyName: string
  program: string
  ratio: '1:1'
  balance: number
  milesNeeded: number
  remaining: number
  enough: boolean
  preferOverBilt: boolean
  keepForHyatt: boolean
  stashWarning: boolean
}

export type TripDraft = {
  destinationMode: DestinationMode
  destination: string
  isDomestic: boolean
  domesticOverride: boolean
  timeframe: Timeframe
  constraints: Constraints
  cashQuotes: CashQuote[]
  awardQuotes: AwardQuote[]
  selectedCashId: string | null
  selectedAwardId: string | null
  payWith: PayWith | null
  chosenTransferKey: BalanceKey | null
  redemptionChannel: RedemptionChannel | null
  mockBookChecks: boolean[]
  positioning: TripPositioning
  hyattStay: HyattStay
  lodgingNotes: string
  hyattSearch: string
  step: WizardStep
  demoLabel: string | null
}

export type Settings = {
  passHash: string
  seatsApiKey: string
  awardWalletUrl: string
  hyattAwards: HyattAwards
}

export type Session = {
  traveler: TravelerName
}

export type AppState = {
  settings: Settings
  balances: BalanceRow[]
  trip: TripDraft
  session: Session | null
  view: View
}
