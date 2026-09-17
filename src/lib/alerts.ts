import type { AwardQuote, TransferBonus, TransferOption } from '../types'

export function bonusExpired(bonus: TransferBonus, today = isoDate()): boolean {
  if (!bonus.endDate) return false
  return bonus.endDate < today
}

export function bonusFilled(bonus: TransferBonus): boolean {
  return Boolean(bonus.fromProgram.trim() && bonus.partner.trim() && bonus.bonusPercent > 0)
}

export function bonusActive(bonus: TransferBonus, today = isoDate()): boolean {
  return bonusFilled(bonus) && !bonusExpired(bonus, today)
}

export function bonusSummary(bonus: TransferBonus): string {
  const pct = bonus.bonusPercent ? `+${bonus.bonusPercent}%` : 'bonus TBD'
  const until = bonus.endDate || 'open end'
  return `${bonus.fromProgram || 'Program'} → ${bonus.partner || 'partner'} ${pct} through ${until}`
}

export function milesWithBonus(miles: number, percent: number): number {
  return Math.round(miles * (1 + Math.max(0, percent) / 100))
}

/** Partner/program name overlap — not a live bonus API. */
export function bonusLikelyApplies(
  bonus: TransferBonus,
  awardProgram: string,
  fromCurrency = '',
  today = isoDate(),
): boolean {
  if (!bonusActive(bonus, today)) return false
  const partner = normalize(bonus.partner)
  const award = normalize(awardProgram)
  if (!partner || !award) return false
  if (!namesOverlap(partner, award)) return false
  if (!fromCurrency.trim()) return true
  return namesOverlap(normalize(bonus.fromProgram), normalize(fromCurrency))
}

export function bonusesForTrip(
  bonuses: TransferBonus[],
  award: AwardQuote | undefined,
  transfer: TransferOption | undefined,
  today = isoDate(),
): { bonus: TransferBonus; likely: boolean }[] {
  return bonuses
    .filter((bonus) => bonusFilled(bonus))
    .map((bonus) => ({
      bonus,
      likely: Boolean(
        award && bonusLikelyApplies(
          bonus,
          award.program,
          transfer?.currencyName ?? '',
          today,
        ),
      ),
    }))
}

function namesOverlap(a: string, b: string): boolean {
  if (!a || !b) return false
  if (a.includes(b) || b.includes(a)) return true
  const tokens = a.split(' ').filter((part) => part.length > 2)
  return tokens.some((part) => b.includes(part))
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function isoDate(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}
