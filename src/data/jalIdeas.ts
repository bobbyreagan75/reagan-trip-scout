import type { JalIdea } from '../types'

/** Editable SAMPLE mile estimates for Rhonda’s native JAL Mileage Bank. Not a live award chart. */
export const SEED_JAL_IDEAS: JalIdea[] = [
  {
    id: 'jal-biz-transpac',
    title: 'JAL business, U.S. West/East ↔ Tokyo',
    region: 'Transpacific',
    cabin: 'business_or_first',
    milesPerPerson: 65000,
    cashCompUsd: 4200,
    taxesUsd: 180,
    sample: true,
    notes: 'SAMPLE one-way estimate on JAL metal. Edit after you mock-book. Two travelers at 65k is 130k of the 240k pile.',
  },
  {
    id: 'jal-first-transpac',
    title: 'JAL first, U.S. ↔ Tokyo',
    region: 'Transpacific',
    cabin: 'business_or_first',
    milesPerPerson: 105000,
    cashCompUsd: 12000,
    taxesUsd: 220,
    sample: true,
    notes: 'SAMPLE one-way first. 105k × 2 = 210k — fits the 240k stash with a little left. Trophy cabin only if the hold is real.',
  },
  {
    id: 'jal-biz-se-asia',
    title: 'JAL business to Southeast Asia via Tokyo',
    region: 'Asia via NRT/HND',
    cabin: 'business_or_first',
    milesPerPerson: 80000,
    cashCompUsd: 5600,
    taxesUsd: 250,
    sample: true,
    notes: 'SAMPLE one-way via Japan. Confirm the through award on the JAL site before anything else.',
  },
]
