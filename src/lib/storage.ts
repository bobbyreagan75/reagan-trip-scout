import { SEED_BONUSES } from '../data/alerts'
import { seedBalanceRows } from '../data/household'
import { SEED_JAL_IDEAS } from '../data/jalIdeas'
import { SEED_WATCHES } from '../data/watches'
import { emptyTrip } from './tripDefaults'
import type { AppState, AwardWatch, BalanceRow, EarnNotes, HyattAwards, JalIdea, Session, Settings, TransferBonus, TripDraft, View } from '../types'

const PREFIX = 'rts.v1'
const SETTINGS_KEY = `${PREFIX}.settings`
const BALANCES_KEY = `${PREFIX}.balances`
const TRIP_KEY = `${PREFIX}.trip`
const SESSION_KEY = `${PREFIX}.session`
const WATCHES_KEY = `${PREFIX}.watches`
const JAL_KEY = `${PREFIX}.jalIdeas`
const BONUSES_KEY = `${PREFIX}.bonuses`
const EARN_KEY = `${PREFIX}.earnNotes`

export function defaultHyattAwards(): HyattAwards {
  return { freeNightCerts: 0, clubAwards: 0 }
}

export function defaultSettings(passHash = ''): Settings {
  return {
    passHash,
    seatsApiKey: '',
    awardWalletUrl: 'https://awardwallet.com/',
    hyattAwards: defaultHyattAwards(),
  }
}

export function loadSettings(): Settings {
  const stored = readJson<Partial<Settings> | null>(SETTINGS_KEY, null) ?? {}
  return {
    ...defaultSettings(),
    ...stored,
    hyattAwards: { ...defaultHyattAwards(), ...(stored.hyattAwards ?? {}) },
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadBalances(): BalanceRow[] {
  const stored = readJson<BalanceRow[] | null>(BALANCES_KEY, null)
  if (stored && stored.length > 0) return stored
  const seeded = seedBalanceRows()
  saveBalances(seeded)
  return seeded
}

export function saveBalances(balances: BalanceRow[]): void {
  localStorage.setItem(BALANCES_KEY, JSON.stringify(balances))
}

export function loadTrip(): TripDraft {
  const stored = readJson<Partial<TripDraft> | null>(TRIP_KEY, null)
  return { ...emptyTrip(), ...(stored ?? {}),
    positioning: { ...emptyTrip().positioning, ...(stored?.positioning ?? {}) },
    hyattStay: { ...emptyTrip().hyattStay, ...(stored?.hyattStay ?? {}) },
    appliedBonusIds: stored?.appliedBonusIds ?? [],
  }
}

export function saveTrip(trip: TripDraft): void {
  localStorage.setItem(TRIP_KEY, JSON.stringify(trip))
}

export function loadWatches(): AwardWatch[] {
  const stored = readJson<AwardWatch[] | null>(WATCHES_KEY, null)
  if (stored && stored.length > 0) return stored
  saveWatches(SEED_WATCHES)
  return SEED_WATCHES
}

export function saveWatches(watches: AwardWatch[]): void {
  localStorage.setItem(WATCHES_KEY, JSON.stringify(watches))
}

export function loadJalIdeas(): JalIdea[] {
  const stored = readJson<JalIdea[] | null>(JAL_KEY, null)
  if (stored && stored.length > 0) return stored
  saveJalIdeas(SEED_JAL_IDEAS)
  return SEED_JAL_IDEAS
}

export function saveJalIdeas(ideas: JalIdea[]): void {
  localStorage.setItem(JAL_KEY, JSON.stringify(ideas))
}

export function loadBonuses(): TransferBonus[] {
  const stored = readJson<TransferBonus[] | null>(BONUSES_KEY, null)
  if (Array.isArray(stored)) return stored
  saveBonuses(SEED_BONUSES)
  return SEED_BONUSES
}

export function saveBonuses(bonuses: TransferBonus[]): void {
  localStorage.setItem(BONUSES_KEY, JSON.stringify(bonuses))
}

export function loadEarnNotes(): EarnNotes {
  const stored = readJson<EarnNotes | null>(EARN_KEY, null)
  return stored ?? {}
}

export function saveEarnNotes(notes: EarnNotes): void {
  localStorage.setItem(EARN_KEY, JSON.stringify(notes))
}

export function loadSession(): Session | null {
  return readJson<Session | null>(SESSION_KEY, null)
}

export function saveSession(session: Session | null): void {
  if (!session) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadPersistedState(): Pick<AppState, 'settings' | 'balances' | 'trip' | 'session' | 'view'> & {
  watches: AwardWatch[]
  jalIdeas: JalIdea[]
  bonuses: TransferBonus[]
  earnNotes: EarnNotes
} {
  return {
    settings: loadSettings(),
    balances: loadBalances(),
    trip: loadTrip(),
    session: loadSession(),
    view: 'home' as View,
    watches: loadWatches(),
    jalIdeas: loadJalIdeas(),
    bonuses: loadBonuses(),
    earnNotes: loadEarnNotes(),
  }
}

export function resetHouseholdData(): void {
  localStorage.removeItem(BALANCES_KEY)
  localStorage.removeItem(TRIP_KEY)
  localStorage.removeItem(WATCHES_KEY)
  localStorage.removeItem(JAL_KEY)
  localStorage.removeItem(BONUSES_KEY)
  localStorage.removeItem(EARN_KEY)
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = (key === SESSION_KEY ? sessionStorage : localStorage).getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
