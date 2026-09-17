const US_AIRPORTS = [
  'ORF', 'IAD', 'DCA', 'BWI', 'JFK', 'EWR', 'LGA', 'BOS', 'ATL', 'ORD', 'MDW',
  'MIA', 'FLL', 'TPA', 'MCO', 'LAX', 'SFO', 'SAN', 'SEA', 'PDX', 'DEN', 'PHX',
  'DFW', 'DAL', 'IAH', 'HOU', 'CLT', 'MSP', 'DTW', 'PHL', 'BNA', 'AUS', 'MSY',
  'RDU', 'RIC', 'CHS', 'SAV', 'LAS', 'SLC', 'MCI', 'STL', 'IND', 'CMH', 'PIT',
  'CLE', 'BDL', 'PVD', 'MKE', 'OKC', 'TUL', 'ABQ', 'OMA', 'SDF', 'MEM', 'JAX',
  'PBI', 'RSW', 'HNL', 'OGG', 'KOA', 'ANC', 'FAI', 'BUR', 'SJC', 'OAK', 'SMF',
]

const US_PLACE_WORDS = [
  'united states', 'u.s.', 'u.s.a.', 'usa', 'america',
  'norfolk', 'virginia beach', 'richmond', 'washington dc', 'washington, dc',
  'new york', 'boston', 'atlanta', 'chicago', 'miami', 'orlando', 'tampa',
  'los angeles', 'san francisco', 'san diego', 'seattle', 'portland', 'denver',
  'phoenix', 'dallas', 'houston', 'austin', 'nashville', 'charleston',
  'new orleans', 'las vegas', 'honolulu', 'maui', 'anchorage', 'philadelphia',
  'charlotte', 'raleigh', 'detroit', 'minneapolis', 'salt lake', 'kansas city',
  'st louis', 'indianapolis', 'pittsburgh', 'cleveland', 'jacksonville',
  'hawaii', 'alaska', 'california', 'texas', 'florida', 'virginia', 'georgia',
  'north carolina', 'south carolina', 'colorado', 'arizona', 'nevada',
  'massachusetts', 'illinois', 'new jersey', 'maryland', 'pennsylvania',
]

const US_STATE_HINTS = [
  ', al', ', ak', ', az', ', ar', ', ca', ', co', ', ct', ', de', ', fl', ', ga',
  ', hi', ', id', ', il', ', in', ', ia', ', ks', ', ky', ', la', ', me', ', md',
  ', ma', ', mi', ', mn', ', ms', ', mo', ', mt', ', ne', ', nv', ', nh', ', nj',
  ', nm', ', ny', ', nc', ', nd', ', oh', ', ok', ', or', ', pa', ', ri', ', sc',
  ', sd', ', tn', ', tx', ', ut', ', vt', ', va', ', wa', ', wv', ', wi', ', wy',
  ', dc',
]

export const DESTINATION_SUGGESTIONS = [
  { label: 'Cairo, Egypt', domestic: false, airport: 'CAI' },
  { label: 'Tokyo, Japan', domestic: false, airport: 'HND' },
  { label: 'Kyoto / Osaka, Japan', domestic: false, airport: 'KIX' },
  { label: 'Paris, France', domestic: false, airport: 'CDG' },
  { label: 'Lisbon, Portugal', domestic: false, airport: 'LIS' },
  { label: 'Cape Town, South Africa', domestic: false, airport: 'CPT' },
  { label: 'Rome, Italy', domestic: false, airport: 'FCO' },
  { label: 'Istanbul, Türkiye', domestic: false, airport: 'IST' },
  { label: 'London, United Kingdom', domestic: false, airport: 'LHR' },
  { label: 'Seoul, South Korea', domestic: false, airport: 'ICN' },
  { label: 'Singapore', domestic: false, airport: 'SIN' },
  { label: 'Sydney, Australia', domestic: false, airport: 'SYD' },
  { label: 'New York, NY', domestic: true, airport: 'JFK' },
  { label: 'Chicago, IL', domestic: true, airport: 'ORD' },
  { label: 'Denver, CO', domestic: true, airport: 'DEN' },
  { label: 'Miami, FL', domestic: true, airport: 'MIA' },
  { label: 'Los Angeles, CA', domestic: true, airport: 'LAX' },
  { label: 'San Francisco, CA', domestic: true, airport: 'SFO' },
  { label: 'Charleston, SC', domestic: true, airport: 'CHS' },
  { label: 'Honolulu, HI', domestic: true, airport: 'HNL' },
] as const

export function extractAirportCode(value: string): string | null {
  const match = value.toUpperCase().match(/\b([A-Z]{3})\b/)
  return match ? match[1] : null
}

export function isDomesticUsDestination(raw: string): boolean {
  const value = raw.trim().toLowerCase()
  if (!value) return false
  const code = extractAirportCode(raw)
  if (code && US_AIRPORTS.includes(code)) return true
  if (US_PLACE_WORDS.some((word) => value.includes(word))) return true
  if (US_STATE_HINTS.some((hint) => value.includes(hint))) return true
  return false
}

export function suggestAirportForDestination(destination: string, domestic: boolean): string {
  const code = extractAirportCode(destination)
  if (code) return code
  const hit = DESTINATION_SUGGESTIONS.find(
    (item) => item.label.toLowerCase() === destination.trim().toLowerCase(),
  )
  if (hit) return hit.airport
  return domestic ? 'NYC' : 'CAI'
}
