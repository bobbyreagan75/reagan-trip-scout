import type { BalanceKey } from '../types'

export type AwardProgram = {
  id: string
  name: string
  aliases: string[]
  alliance: 'star' | 'oneworld' | 'skyteam' | 'none'
  nativeBalance?: BalanceKey
}

export const AWARD_PROGRAMS: AwardProgram[] = [
  { id: 'aeroplan', name: 'Aeroplan', aliases: ['aeroplan', 'air canada'], alliance: 'star', nativeBalance: 'Aeroplan' },
  { id: 'united', name: 'United MileagePlus', aliases: ['united', 'mileageplus'], alliance: 'star' },
  { id: 'lifemiles', name: 'Avianca LifeMiles', aliases: ['lifemiles', 'avianca'], alliance: 'star' },
  { id: 'krisflyer', name: 'Singapore KrisFlyer', aliases: ['krisflyer', 'singapore', 'sia'], alliance: 'star' },
  { id: 'turkish', name: 'Turkish Miles&Smiles', aliases: ['turkish', 'miles&smiles', 'miles and smiles'], alliance: 'star' },
  { id: 'ana', name: 'ANA Mileage Club', aliases: ['ana', 'mileage club'], alliance: 'star' },
  { id: 'eva', name: 'EVA Infinity MileageLands', aliases: ['eva', 'infinity'], alliance: 'star' },
  { id: 'tap', name: 'TAP Miles&Go', aliases: ['tap', 'miles&go', 'portugal'], alliance: 'star' },
  { id: 'egyptair', name: 'EgyptAir Plus', aliases: ['egyptair', 'egypt air'], alliance: 'star' },
  { id: 'delta', name: 'Delta SkyMiles', aliases: ['delta', 'skymiles'], alliance: 'skyteam', nativeBalance: 'Delta_Robert' },
  { id: 'flyingblue', name: 'Flying Blue', aliases: ['flying blue', 'air france', 'klm'], alliance: 'skyteam' },
  { id: 'virgin', name: 'Virgin Atlantic Flying Club', aliases: ['virgin'], alliance: 'skyteam' },
  { id: 'aeromexico', name: 'Aeromexico Club Premier', aliases: ['aeromexico', 'club premier'], alliance: 'skyteam' },
  { id: 'emirates', name: 'Emirates Skywards', aliases: ['emirates', 'skywards'], alliance: 'none' },
  { id: 'etihad', name: 'Etihad Guest', aliases: ['etihad'], alliance: 'none' },
  { id: 'qatar', name: 'Qatar Privilege Club', aliases: ['qatar', 'privilege club', 'avion'], alliance: 'oneworld' },
  { id: 'ba', name: 'British Airways Executive Club', aliases: ['british airways', 'ba avios', 'avios ba'], alliance: 'oneworld' },
  { id: 'iberia', name: 'Iberia Plus', aliases: ['iberia'], alliance: 'oneworld' },
  { id: 'cathay', name: 'Cathay Asia Miles', aliases: ['cathay', 'asia miles'], alliance: 'oneworld' },
  { id: 'qantas', name: 'Qantas Frequent Flyer', aliases: ['qantas'], alliance: 'oneworld' },
  { id: 'jal', name: 'JAL Mileage Bank', aliases: ['jal', 'japan airlines', 'jmb'], alliance: 'oneworld', nativeBalance: 'JAL_JMB_Rhonda' },
  { id: 'jetblue', name: 'JetBlue TrueBlue', aliases: ['jetblue', 'trueblue'], alliance: 'none' },
  { id: 'alaska', name: 'Alaska Mileage Plan', aliases: ['alaska', 'mileage plan'], alliance: 'oneworld' },
  { id: 'hyatt', name: 'World of Hyatt', aliases: ['hyatt'], alliance: 'none', nativeBalance: 'Hyatt_Rhonda' },
]

/** Flexible currencies that transfer 1:1 into an award program. Native airline wallets are not listed here. */
export const TRANSFERS_1_TO_1: Record<BalanceKey, string[]> = {
  Amex_MR_combined: [
    'aeroplan',
    'flyingblue',
    'ana',
    'lifemiles',
    'ba',
    'cathay',
    'delta',
    'emirates',
    'etihad',
    'iberia',
    'jetblue',
    'qantas',
    'qatar',
    'krisflyer',
    'virgin',
    'aeromexico',
  ],
  Bilt_combined: [
    'aeroplan',
    'flyingblue',
    'lifemiles',
    'ba',
    'cathay',
    'emirates',
    'iberia',
    'turkish',
    'united',
    'virgin',
    'alaska',
    'hyatt',
    'aeromexico',
    'tap',
  ],
  Chase_UR_deduped: [
    'united',
    'jetblue',
    'ba',
    'aeroplan',
    'flyingblue',
    'virgin',
    'iberia',
    'hyatt',
  ],
  Cap_One: [
    'aeroplan',
    'lifemiles',
    'ba',
    'cathay',
    'emirates',
    'etihad',
    'flyingblue',
    'qantas',
    'qatar',
    'krisflyer',
    'tap',
    'turkish',
    'virgin',
  ],
  Citi_TY: [
    'aeromexico',
    'lifemiles',
    'cathay',
    'emirates',
    'etihad',
    'eva',
    'flyingblue',
    'jetblue',
    'qantas',
    'qatar',
    'krisflyer',
    'turkish',
    'virgin',
  ],
  JAL_JMB_Rhonda: [],
  Hyatt_Rhonda: [],
  Delta_Robert: [],
  Aeroplan: [],
}

export function normalizeProgramQuery(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9+& ]+/g, ' ').replace(/\s+/g, ' ')
}

export function findAwardProgram(query: string): AwardProgram | undefined {
  const q = normalizeProgramQuery(query)
  if (!q) return undefined
  return AWARD_PROGRAMS.find((program) => {
    if (program.id === q || normalizeProgramQuery(program.name) === q) return true
    return program.aliases.some((alias) => q.includes(alias) || alias.includes(q))
  })
}
