import { AIRPORTS } from './household'
import type { Daypart } from '../types'

export const POSITION_PRIMARY = AIRPORTS.internationalPosition

export const POSITION_BACKUPS = ['JFK', 'EWR', 'BOS', 'ATL', 'ORD', 'MIA'] as const

export const DAYPARTS: { id: Daypart; label: string; flag: 'ok' | 'caution' | 'avoid' }[] = [
  { id: 'early', label: 'Dawn / before 8am', flag: 'avoid' },
  { id: 'morning', label: 'Morning', flag: 'caution' },
  { id: 'afternoon', label: 'Afternoon', flag: 'ok' },
  { id: 'evening', label: 'Evening (preferred)', flag: 'ok' },
  { id: 'late', label: 'Late / last departure', flag: 'ok' },
]
