import { COS_EMAIL } from '../data/household'
import type { AwardWatch, Cabin } from '../types'
import { formatMiles } from './format'
import { seatsAeroSearchUrl } from './seatsAero'
import { googleFlightsSearchUrl } from './googleFlights'

function cabinLabel(cabin: Cabin): string {
  if (cabin === 'business_or_first') return 'business / first'
  if (cabin === 'premium_economy') return 'premium economy'
  return 'coach'
}

export function watchSummary(watch: AwardWatch): string {
  return `${watch.metal} ${watch.origin}–${watch.destination} ${cabinLabel(watch.cabin)} ≤${formatMiles(watch.maxMiles)} for ${watch.seatsNeeded}`
}

export function watchAlertText(watch: AwardWatch): string {
  return [
    'Reagan Trip Scout — award watch for Robert & Rhonda Reagan',
    '',
    `Metal / program: ${watch.metal} · ${watch.program}`,
    `Route: ${watch.origin}–${watch.destination}`,
    `Cabin: ${cabinLabel(watch.cabin)}`,
    `Max miles: ${formatMiles(watch.maxMiles)} · Seats: ${watch.seatsNeeded}`,
    `Date window: ${watch.windowStart || 'open'} → ${watch.windowEnd || 'open'}`,
    watch.notes ? `Notes: ${watch.notes}` : '',
    '',
    'This desk does not scrape availability. If this prints, tell the household.',
    'Chief of Staff can email or continue in chat later — for now this is copy + mailto only.',
  ].filter((line) => line !== '').join('\n')
}

export function watchMailto(watch: AwardWatch): string {
  const url = new URL(`mailto:${COS_EMAIL}`)
  url.searchParams.set('subject', `Award watch: ${watchSummary(watch)}`)
  url.searchParams.set('body', watchAlertText(watch).slice(0, 1800))
  return url.toString()
}

export function watchSeatsUrl(watch: AwardWatch): string {
  return seatsAeroSearchUrl({
    origin: watch.origin,
    destination: watch.destination,
    cabin: watch.cabin,
  })
}

export function watchFlightsUrl(watch: AwardWatch): string {
  return googleFlightsSearchUrl({
    origin: watch.origin,
    destination: watch.destination,
    startDate: watch.windowStart,
    endDate: watch.windowEnd,
    cabin: watch.cabin,
    partySize: watch.seatsNeeded,
  })
}

export function emptyWatchForm(): AwardWatch {
  return {
    id: '',
    metal: '',
    program: '',
    origin: '',
    destination: '',
    cabin: 'business_or_first',
    maxMiles: 75000,
    seatsNeeded: 2,
    windowStart: '',
    windowEnd: '',
    notes: '',
  }
}
