import { MIN_CPP } from '../data/household'
import type { JalIdea } from '../types'
import { centsPerPoint, cppVerdict, formatCpp } from './cpp'

export function jalCoverage(balance: number, milesPerPerson: number, partySize: number) {
  const need = milesPerPerson * partySize
  return {
    need,
    remaining: balance - need,
    enough: balance >= need,
    partyTrips: need > 0 ? Math.floor(balance / need) : 0,
  }
}

export function jalIdeaCpp(idea: JalIdea) {
  const cpp = centsPerPoint(idea.cashCompUsd, idea.milesPerPerson, idea.taxesUsd)
  return { cpp, label: formatCpp(cpp), verdict: cppVerdict(cpp) }
}

export function jalPoorValue(idea: JalIdea): boolean {
  const { cpp } = jalIdeaCpp(idea)
  return cpp !== null && cpp < MIN_CPP
}
