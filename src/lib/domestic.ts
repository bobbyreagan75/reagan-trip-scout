import { isDomesticUsDestination } from '../data/destinations'
import type { DestinationMode } from '../types'

export function resolveDomestic(destination: string, mode: DestinationMode, override?: boolean | null): boolean {
  if (mode === 'deal_first') return false
  if (typeof override === 'boolean') return override
  return isDomesticUsDestination(destination)
}

export { isDomesticUsDestination }
