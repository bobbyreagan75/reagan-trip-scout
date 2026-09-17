import type { EarnCard, TransferBonus } from '../types'

/** SAMPLE placeholders — edit when a real 1:1-plus-bonus window is live. Not a live tracker. */
export const SEED_BONUSES: TransferBonus[] = [
  {
    id: 'bonus-sample-amex-aeroplan',
    fromProgram: 'Amex Membership Rewards',
    partner: 'Aeroplan',
    bonusPercent: 30,
    endDate: '2026-10-31',
    notes: 'SAMPLE placeholder. Replace with a live window, or delete. Extra miles on a 1:1 base only — mock-book before anything moves.',
    sample: true,
  },
  {
    id: 'bonus-sample-chase-hyatt',
    fromProgram: 'Chase Ultimate Rewards',
    partner: 'World of Hyatt',
    bonusPercent: 20,
    endDate: '2026-09-30',
    notes: 'SAMPLE placeholder. Chase→Hyatt is rare; keep this row only if a real window exists. Bilt is still the Hyatt pile we protect.',
    sample: true,
  },
]

export const EARN_CARDS: EarnCard[] = [
  {
    id: 'bilt',
    card: 'Bilt',
    tip: 'Rent is the house Bilt play. Grow this pile for Hyatt, not for an airline Amex can already reach. Natural rent and Bilt dining/travel only.',
  },
  {
    id: 'amex-gold',
    card: 'Amex Gold',
    tip: 'Groceries and dining you already buy. Gold is an earn card, not a reason to eat out extra.',
  },
  {
    id: 'amex-plat',
    card: 'Amex Platinum',
    tip: 'Flights and the incidentals you were going to buy anyway. Membership Rewards first when Bilt can also reach the airline.',
  },
  {
    id: 'csr',
    card: 'Chase Sapphire Reserve',
    tip: 'Travel and dining on the Chase side when that is the pile you want to grow. Natural spend — not a spend stunt.',
  },
  {
    id: 'flex',
    card: 'Chase Freedom Flex',
    tip: 'Rotating 5% this quarter. Paste the live categories below. Use it on household spend that was happening anyway.',
    flexPlaceholder: true,
  },
  {
    id: 'unlimited',
    card: 'Chase Freedom Unlimited',
    tip: 'Everyday leftovers after Flex categories. 1.5× on the rest of household spend — not a reason to shop.',
  },
  {
    id: 'ink',
    card: 'Chase Ink Business Preferred',
    tip: 'Travel, shipping, ads, and telecom on actual bills. Keep it on work and household invoices you already pay.',
  },
]

export function emptyBonus(): TransferBonus {
  return {
    id: '',
    fromProgram: '',
    partner: '',
    bonusPercent: 0,
    endDate: '',
    notes: '',
    sample: false,
  }
}
