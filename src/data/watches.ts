import type { AwardWatch } from '../types'

export const SEED_WATCHES: AwardWatch[] = [
  {
    id: 'watch-egyptair-jfk-cai-may-2027',
    metal: 'EgyptAir',
    program: 'Aeroplan or Star partner',
    origin: 'JFK',
    destination: 'CAI',
    cabin: 'business_or_first',
    maxMiles: 75000,
    seatsNeeded: 2,
    windowStart: '2027-05-01',
    windowEnd: '2027-05-31',
    notes: 'Seed watch: EgyptAir metal, business, two seats, at or under 75k around May 2027. Replace if you lock a better print.',
  },
]
