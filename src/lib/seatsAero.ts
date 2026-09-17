export function seatsAeroSearchUrl(params: {
  origin: string
  destination: string
  cabin?: string
}): string {
  const url = new URL('https://seats.aero/')
  url.searchParams.set('origin', params.origin.toUpperCase())
  url.searchParams.set('destination', params.destination.toUpperCase())
  if (params.cabin === 'business_or_first') url.searchParams.set('cabin', 'business')
  if (params.cabin === 'premium_economy') url.searchParams.set('cabin', 'premium')
  if (params.cabin === 'coach') url.searchParams.set('cabin', 'economy')
  return url.toString()
}

export function seatsAeroExplorerUrl(origin: string): string {
  const url = new URL('https://seats.aero/')
  url.searchParams.set('origin', origin.toUpperCase())
  return url.toString()
}

export type SeatsFetchResult =
  | { ok: true; preview: string }
  | { ok: false; reason: string }

/** Optional later-phase hook. Browser CORS often blocks this; paste-back remains the v1 path. */
export async function trySeatsAeroFetch(apiKey: string, origin: string, destination: string): Promise<SeatsFetchResult> {
  const key = apiKey.trim()
  if (!key) return { ok: false, reason: 'No seats.aero API key saved in Settings.' }
  try {
    const url = new URL('https://seats.aero/partnerapi/search')
    url.searchParams.set('origin_airport', origin)
    url.searchParams.set('destination_airport', destination)
    const res = await fetch(url, {
      headers: { 'Partner-Authorization': key },
    })
    if (!res.ok) {
      return { ok: false, reason: `seats.aero responded ${res.status}. Use the deep link and paste results.` }
    }
    const text = await res.text()
    return { ok: true, preview: text.slice(0, 2000) }
  } catch {
    return {
      ok: false,
      reason: 'The browser blocked or could not reach the seats.aero API. Open the deep link and paste miles, taxes, and seats instead.',
    }
  }
}
