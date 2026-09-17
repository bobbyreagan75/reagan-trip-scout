export function googleFlightsSearchUrl(params: {
  origin: string
  destination: string
  startDate?: string
  endDate?: string
  cabin?: string
  partySize?: number
}): string {
  const bits = [`Flights from ${params.origin} to ${params.destination}`]
  if (params.startDate && params.endDate) {
    bits.push(`${params.startDate} through ${params.endDate}`)
  } else if (params.startDate) {
    bits.push(`departing ${params.startDate}`)
  }
  if (params.cabin === 'business_or_first') bits.push('business class')
  if (params.cabin === 'premium_economy') bits.push('premium economy')
  if (params.partySize && params.partySize !== 1) bits.push(`${params.partySize} passengers`)
  const url = new URL('https://www.google.com/travel/flights')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('curr', 'USD')
  url.searchParams.set('q', bits.join(' '))
  return url.toString()
}

export function googleFlightsExploreUrl(origin: string, startDate?: string): string {
  const bits = [`Explore flights from ${origin}`]
  if (startDate) bits.push(`around ${startDate}`)
  const url = new URL('https://www.google.com/travel/explore')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('curr', 'USD')
  url.searchParams.set('q', bits.join(' '))
  return url.toString()
}

export function kayakExploreUrl(origin: string): string {
  return `https://www.kayak.com/explore/${encodeURIComponent(origin)}-anywhere`
}
