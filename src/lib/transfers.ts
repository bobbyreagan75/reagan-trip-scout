import { EMERGENCY_STASH_PER_TRAVELER } from '../data/household'
import { findAwardProgram, TRANSFERS_1_TO_1 } from '../data/partners'
import type { AwardQuote, BalanceKey, BalanceRow, TransferOption } from '../types'

const FLEXIBLE: BalanceKey[] = [
  'Amex_MR_combined',
  'Citi_TY',
  'Bilt_combined',
  'Cap_One',
  'Chase_UR_deduped',
]

export function transferOptions(params: {
  award: AwardQuote
  balances: BalanceRow[]
  partySize: number
}): TransferOption[] {
  const program = findAwardProgram(params.award.program)
  const programId = program?.id
  const milesNeeded = params.award.miles * params.partySize
  const stashFloor = EMERGENCY_STASH_PER_TRAVELER * 2
  const options: TransferOption[] = []

  if (program?.nativeBalance) {
    const row = params.balances.find((item) => item.key === program.nativeBalance)
    if (row) {
      options.push(buildOption({
        row,
        programName: program.name,
        milesNeeded,
        stashFloor,
        preferOverBilt: false,
        keepForHyatt: row.key === 'Hyatt_Rhonda',
      }))
    }
  }

  if (programId) {
    for (const key of FLEXIBLE) {
      const partners = TRANSFERS_1_TO_1[key]
      if (!partners.includes(programId)) continue
      const row = params.balances.find((item) => item.key === key)
      if (!row) continue
      options.push(buildOption({
        row,
        programName: program?.name ?? params.award.program,
        milesNeeded,
        stashFloor,
        preferOverBilt: key === 'Amex_MR_combined',
        keepForHyatt: key === 'Bilt_combined' && programId !== 'hyatt',
      }))
    }
  }

  const amexWorks = options.some((item) => item.currencyKey === 'Amex_MR_combined')
  return options
    .map((item) => ({
      ...item,
      preferOverBilt: item.currencyKey === 'Amex_MR_combined' && options.some((o) => o.currencyKey === 'Bilt_combined'),
      keepForHyatt: item.currencyKey === 'Bilt_combined' && amexWorks && programId !== 'hyatt',
    }))
    .sort(sortTransfers)
}

function buildOption(params: {
  row: BalanceRow
  programName: string
  milesNeeded: number
  stashFloor: number
  preferOverBilt: boolean
  keepForHyatt: boolean
}): TransferOption {
  const remaining = params.row.amount - params.milesNeeded
  return {
    currencyKey: params.row.key,
    currencyName: params.row.program,
    program: params.programName,
    ratio: '1:1',
    balance: params.row.amount,
    milesNeeded: params.milesNeeded,
    remaining,
    enough: params.row.amount >= params.milesNeeded,
    preferOverBilt: params.preferOverBilt,
    keepForHyatt: params.keepForHyatt,
    stashWarning: remaining < params.stashFloor,
  }
}

function sortTransfers(a: TransferOption, b: TransferOption): number {
  if (a.preferOverBilt !== b.preferOverBilt) return a.preferOverBilt ? -1 : 1
  if (a.enough !== b.enough) return a.enough ? -1 : 1
  if (a.keepForHyatt !== b.keepForHyatt) return a.keepForHyatt ? 1 : -1
  return b.balance - a.balance
}

export function recommendedTransfer(options: TransferOption[]): TransferOption | undefined {
  return options.find((item) => item.enough) ?? options[0]
}
