import { seedBalanceRows } from '../data/household'
import { emptyTrip } from './tripDefaults'
import type { AppState, BalanceRow, Session, Settings, TripDraft, View } from '../types'

const PREFIX = 'rts.v1'
const SETTINGS_KEY = `${PREFIX}.settings`
const BALANCES_KEY = `${PREFIX}.balances`
const TRIP_KEY = `${PREFIX}.trip`
const SESSION_KEY = `${PREFIX}.session`

export function defaultSettings(passHash = ''): Settings {
  return {
    passHash,
    seatsApiKey: '',
    awardWalletUrl: 'https://awardwallet.com/',
  }
}

export function loadSettings(): Settings {
  return readJson(SETTINGS_KEY, defaultSettings())
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
  return readJson(TRIP_KEY, emptyTrip())
}

export function saveTrip(trip: TripDraft): void {
  localStorage.setItem(TRIP_KEY, JSON.stringify(trip))
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

export function loadPersistedState(): Pick<AppState, 'settings' | 'balances' | 'trip' | 'session' | 'view'> {
  return {
    settings: loadSettings(),
    balances: loadBalances(),
    trip: loadTrip(),
    session: loadSession(),
    view: 'home' as View,
  }
}

export function resetHouseholdData(): void {
  localStorage.removeItem(BALANCES_KEY)
  localStorage.removeItem(TRIP_KEY)
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
