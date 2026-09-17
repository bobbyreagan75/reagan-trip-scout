import { AIRPORTS } from '../data/household'
import { DAYPARTS, POSITION_BACKUPS, POSITION_PRIMARY } from '../data/positioning'
import type { Daypart, TripPositioning } from '../types'
import { googleFlightsSearchUrl } from './googleFlights'

export function isEarlyDaypart(daypart: Daypart): boolean {
  return daypart === 'early' || daypart === 'morning'
}

export function positioningReady(positioning: TripPositioning, isDomestic: boolean): boolean {
  if (isDomestic) return true
  return positioning.backups.length >= 2 && positioning.backups.length <= 6
}

export function positioningHint(positioning: TripPositioning, isDomestic: boolean): string {
  if (isDomestic) return `Domestic hops leave from ${AIRPORTS.domesticHome}. No positioning flight.`
  const n = positioning.backups.length
  if (n < 2) return `Pick at least two backup gateways besides ${POSITION_PRIMARY}. Three is better.`
  if (n === 2) return 'Two backups locked. Add a third if the calendar allows.'
  return `${n} backups plus ${POSITION_PRIMARY} — enough to hunt.`
}

export function toggleBackup(current: string[], code: string): string[] {
  if (current.includes(code)) return current.filter((item) => item !== code)
  return [...current, code]
}

export function orfToGatewayUrl(gateway: string, startDate?: string, partySize = 2): string {
  return googleFlightsSearchUrl({
    origin: AIRPORTS.domesticHome,
    destination: gateway,
    startDate,
    cabin: 'coach',
    partySize,
  })
}

export function daypartMeta(daypart: Daypart) {
  return DAYPARTS.find((item) => item.id === daypart) ?? DAYPARTS[3]
}

export function allPositionGateways(positioning: TripPositioning): string[] {
  const set = new Set([positioning.primary || POSITION_PRIMARY, ...positioning.backups])
  return [...set]
}

export { POSITION_BACKUPS, POSITION_PRIMARY }
