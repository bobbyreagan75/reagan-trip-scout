import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cairoDemoTrip } from '../data/cairoDemo'
import { seedBalanceRows } from '../data/household'
import { demoPassHash, hashPassphrase, verifyPassphrase } from '../lib/auth'
import {
  defaultSettings,
  loadPersistedState,
  resetHouseholdData,
  saveBalances,
  saveSession,
  saveSettings,
  saveTrip,
} from '../lib/storage'
import { emptyTrip } from '../lib/tripDefaults'
import type { BalanceRow, Session, Settings, TravelerName, TripDraft, View } from '../types'

type AppContextValue = {
  settings: Settings
  balances: BalanceRow[]
  trip: TripDraft
  session: Session | null
  view: View
  ready: boolean
  login: (traveler: TravelerName, passphrase: string) => Promise<boolean>
  logout: () => void
  setView: (view: View) => void
  setTrip: (trip: TripDraft | ((current: TripDraft) => TripDraft)) => void
  setBalances: (balances: BalanceRow[] | ((current: BalanceRow[]) => BalanceRow[])) => void
  updateSettings: (patch: Partial<Settings>) => void
  changePassphrase: (next: string) => Promise<void>
  loadCairoDemo: () => void
  newTrip: () => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings())
  const [balances, setBalancesState] = useState<BalanceRow[]>([])
  const [trip, setTripState] = useState<TripDraft>(emptyTrip())
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    const persisted = loadPersistedState()
    setBalancesState(persisted.balances)
    setTripState(persisted.trip)
    setSession(persisted.session)
    void (async () => {
      const stored = persisted.settings
      if (!stored.passHash) {
        const seeded = { ...stored, passHash: await demoPassHash() }
        saveSettings(seeded)
        setSettings(seeded)
      } else {
        setSettings(stored)
      }
      setReady(true)
    })()
  }, [])

  const setTrip = useCallback((next: TripDraft | ((current: TripDraft) => TripDraft)) => {
    setTripState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
      saveTrip(resolved)
      return resolved
    })
  }, [])

  const setBalances = useCallback((next: BalanceRow[] | ((current: BalanceRow[]) => BalanceRow[])) => {
    setBalancesState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
      saveBalances(resolved)
      return resolved
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const resolved = { ...current, ...patch }
      saveSettings(resolved)
      return resolved
    })
  }, [])

  const login = useCallback(async (traveler: TravelerName, passphrase: string) => {
    const ok = await verifyPassphrase(passphrase, settings.passHash)
    if (!ok) return false
    const next = { traveler }
    setSession(next)
    saveSession(next)
    setView('home')
    return true
  }, [settings.passHash])

  const logout = useCallback(() => {
    setSession(null)
    saveSession(null)
  }, [])

  const changePassphrase = useCallback(async (next: string) => {
    updateSettings({ passHash: await hashPassphrase(next) })
  }, [updateSettings])

  const loadCairoDemo = useCallback(() => {
    setTrip(cairoDemoTrip())
    setView('plan')
  }, [setTrip])

  const newTrip = useCallback(() => {
    setTrip(emptyTrip())
    setView('plan')
  }, [setTrip])

  const resetData = useCallback(() => {
    resetHouseholdData()
    setBalancesState(seedBalanceRows())
    saveBalances(seedBalanceRows())
    setTrip(emptyTrip())
  }, [setTrip])

  const value = useMemo<AppContextValue>(() => ({
    settings,
    balances,
    trip,
    session,
    view,
    ready,
    login,
    logout,
    setView,
    setTrip,
    setBalances,
    updateSettings,
    changePassphrase,
    loadCairoDemo,
    newTrip,
    resetData,
  }), [
    settings,
    balances,
    trip,
    session,
    view,
    ready,
    login,
    logout,
    setTrip,
    setBalances,
    updateSettings,
    changePassphrase,
    loadCairoDemo,
    newTrip,
    resetData,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
