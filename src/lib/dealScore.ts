import {
  CASH_CEILINGS_PER_HOUR,
  LUXURY_CPP_TARGET,
  MIN_CPP,
  MOCK_BOOK_ITEMS,
  NEVER_PASS_CHANNELS,
} from '../data/household'
import type { AwardQuote, BalanceRow, CashQuote, DealVerdict, RedemptionChannel, TripDraft } from '../types'
import { ceilingForQuote, dollarsPerHourForQuote } from './ceilings'
import { cppForQuotes, formatCpp } from './cpp'
import { formatUsd } from './format'
import { recommendedTransfer, transferOptions } from './transfers'

export type DealCheck = {
  id: string
  label: string
  verdict: DealVerdict
  detail: string
  numbers: Record<string, string>
}

export type LaneScore = {
  lane: 'cash' | 'points'
  verdict: DealVerdict
  allowed: boolean
  headline: string
  checks: DealCheck[]
}

export type DealScore = {
  overall: DealVerdict
  canProceedToPay: boolean
  canBookCash: boolean
  canBookPoints: boolean
  recommended: 'cash' | 'points' | null
  summary: string
  channel: RedemptionChannel | null
  lanes: LaneScore[]
}

const RANK: Record<DealVerdict, number> = { FAIL: 0, MARGINAL: 1, PASS: 2 }

const NEVER_PASS_LABEL: Record<(typeof NEVER_PASS_CHANNELS)[number], string> = {
  portal: 'card travel portal',
  gift_card: 'gift card',
  statement_credit: 'statement credit',
  cruise_flexible_points: 'cruise booked with flexible points',
}

export function selectedCash(trip: TripDraft): CashQuote | undefined {
  return trip.cashQuotes.find((q) => q.id === trip.selectedCashId) ?? trip.cashQuotes[0]
}

export function selectedAward(trip: TripDraft): AwardQuote | undefined {
  return trip.awardQuotes.find((q) => q.id === trip.selectedAwardId) ?? trip.awardQuotes[0]
}

export function isNeverPassChannel(
  channel: RedemptionChannel | null,
): channel is (typeof NEVER_PASS_CHANNELS)[number] {
  return channel !== null && (NEVER_PASS_CHANNELS as readonly string[]).includes(channel)
}

export function mockBookComplete(checks: boolean[]): boolean {
  return MOCK_BOOK_ITEMS.length > 0 && checks.length >= MOCK_BOOK_ITEMS.length && checks.every(Boolean)
}

export function scoreDeal(trip: TripDraft, balances: BalanceRow[]): DealScore {
  const cash = selectedCash(trip)
  const award = selectedAward(trip)
  const neverPass = isNeverPassChannel(trip.redemptionChannel)
  const channelCheck = scoreChannel(trip.redemptionChannel)

  const cashLane = scoreCashLane(cash, neverPass, channelCheck)
  const pointsLane = scorePointsLane(trip, cash, award, balances, neverPass, channelCheck)

  const lanes = [cashLane, pointsLane]
  const viable = lanes.filter((lane) => lane.allowed)
  const best = viable.reduce<DealVerdict | null>((acc, lane) => {
    if (!acc) return lane.verdict
    return RANK[lane.verdict] > RANK[acc] ? lane.verdict : acc
  }, null)

  const overall: DealVerdict = !trip.redemptionChannel || neverPass || best === null ? 'FAIL' : best
  const recommended = pickRecommended(viable)
  const canProceedToPay = Boolean(trip.redemptionChannel) && !neverPass && viable.length > 0
  const booked = mockBookComplete(trip.mockBookChecks)

  return {
    overall,
    canProceedToPay,
    canBookCash: canProceedToPay && cashLane.allowed,
    canBookPoints: canProceedToPay && pointsLane.allowed && booked,
    recommended,
    summary: summarize(overall, recommended, cashLane, pointsLane, trip),
    channel: trip.redemptionChannel,
    lanes,
  }
}

function pickRecommended(viable: LaneScore[]): 'cash' | 'points' | null {
  if (viable.length === 0) return null
  const passes = viable.filter((lane) => lane.verdict === 'PASS')
  const pool = passes.length ? passes : viable
  const points = pool.find((lane) => lane.lane === 'points')
  const cash = pool.find((lane) => lane.lane === 'cash')
  if (points && points.verdict === 'PASS') return 'points'
  if (cash) return 'cash'
  return pool[0].lane
}

function scoreChannel(channel: RedemptionChannel | null): DealCheck {
  if (!channel) {
    return {
      id: 'channel',
      label: 'Redemption type',
      verdict: 'FAIL',
      detail: 'Say how this redemption works before the gate can open.',
      numbers: { channel: 'unspecified' },
    }
  }
  if (isNeverPassChannel(channel)) {
    const label = NEVER_PASS_LABEL[channel]
    return {
      id: 'channel',
      label: 'Redemption type',
      verdict: 'FAIL',
      detail: `Household rule: ${label} never clears this gate. Keep the points for flights and Hyatt.`,
      numbers: { channel: label },
    }
  }
  return {
    id: 'channel',
    label: 'Redemption type',
    verdict: 'PASS',
    detail: 'Airline ticket or program award — the only redemptions this desk will score.',
    numbers: { channel: 'airline / program' },
  }
}

function scoreCashLane(
  cash: CashQuote | undefined,
  neverPass: boolean,
  channelCheck: DealCheck,
): LaneScore {
  const checks: DealCheck[] = [channelCheck]
  if (neverPass) {
    return {
      lane: 'cash',
      verdict: 'FAIL',
      allowed: false,
      headline: 'Blocked — this redemption type never passes.',
      checks,
    }
  }
  if (!cash) {
    checks.push({
      id: 'cash_quote',
      label: 'Cash fare',
      verdict: 'FAIL',
      detail: 'Paste a Google Flights total before cash can be scored.',
      numbers: { cashUsd: '—' },
    })
    return { lane: 'cash', verdict: 'FAIL', allowed: false, headline: 'No cash fare to score.', checks }
  }

  const rate = CASH_CEILINGS_PER_HOUR[cash.cabin]
  const dph = dollarsPerHourForQuote(cash)
  const ceiling = ceilingForQuote(cash)
  const roundTrip = Boolean(cash.returnDate)
  const cabinLabel = cash.cabin.replaceAll('_', ' ')

  if (dph === null || ceiling === null) {
    checks.push({
      id: 'cash_hourly',
      label: 'Cash $/hour',
      verdict: 'MARGINAL',
      detail: `Need nonstop block hours to score against the ${formatUsd(rate)}/hour ${cabinLabel} ceiling.`,
      numbers: {
        fare: formatUsd(cash.cashUsd),
        hours: 'missing',
        ceilingPerHour: formatUsd(rate),
      },
    })
    const verdict: DealVerdict = 'MARGINAL'
    return {
      lane: 'cash',
      verdict,
      allowed: channelCheck.verdict === 'PASS',
      headline: `MARGINAL — ${formatUsd(cash.cashUsd)} pp, hours missing so the hourly cap cannot be proven.`,
      checks,
    }
  }

  const over = dph > rate
  const verdict: DealVerdict = over ? 'FAIL' : 'PASS'
  checks.push({
    id: 'cash_hourly',
    label: 'Cash $/hour',
    verdict,
    detail: over
      ? `${formatUsd(dph)} per airborne hour sits over the ${formatUsd(rate)} ${cabinLabel} ceiling. Round-trip ${roundTrip ? 'is' : 'is not'} applied. Total cap ${formatUsd(ceiling)} vs fare ${formatUsd(cash.cashUsd)} pp.`
      : `${formatUsd(dph)} per airborne hour is inside the ${formatUsd(rate)} ${cabinLabel} ceiling. Total cap ${formatUsd(ceiling)} vs fare ${formatUsd(cash.cashUsd)} pp.`,
    numbers: {
      farePerPerson: formatUsd(cash.cashUsd),
      dollarsPerHour: formatUsd(dph),
      ceilingPerHour: formatUsd(rate),
      totalCeiling: formatUsd(ceiling),
      hoursOneWay: String(cash.hoursOneWay),
      roundTrip: roundTrip ? 'yes' : 'no',
      cabin: cabinLabel,
    },
  })

  return {
    lane: 'cash',
    verdict,
    allowed: verdict !== 'FAIL' && channelCheck.verdict === 'PASS',
    headline: verdict === 'PASS'
      ? `PASS — ${formatUsd(dph)}/hr vs ${formatUsd(rate)}/hr ${cabinLabel} ceiling.`
      : `FAIL — ${formatUsd(dph)}/hr vs ${formatUsd(rate)}/hr ${cabinLabel} ceiling (${formatUsd(cash.cashUsd)} vs ${formatUsd(ceiling)} cap).`,
    checks,
  }
}

function scorePointsLane(
  trip: TripDraft,
  cash: CashQuote | undefined,
  award: AwardQuote | undefined,
  balances: BalanceRow[],
  neverPass: boolean,
  channelCheck: DealCheck,
): LaneScore {
  const checks: DealCheck[] = [channelCheck]

  if (neverPass) {
    return {
      lane: 'points',
      verdict: 'FAIL',
      allowed: false,
      headline: 'Blocked — this redemption type never passes.',
      checks,
    }
  }

  if (trip.isDomestic) {
    checks.push({
      id: 'domestic_points',
      label: 'Domestic lane',
      verdict: 'FAIL',
      detail: 'U.S. domestic trips are cash only. A points redemption fails this gate even if the CPP looks pretty.',
      numbers: { lane: 'domestic US', path: 'cash only' },
    })
    return {
      lane: 'points',
      verdict: 'FAIL',
      allowed: false,
      headline: 'FAIL — domestic U.S. points redemptions do not pass.',
      checks,
    }
  }

  if (!award) {
    checks.push({
      id: 'award_quote',
      label: 'Award fare',
      verdict: 'FAIL',
      detail: 'Paste miles, taxes, program, and seats before points can be scored.',
      numbers: { miles: '—' },
    })
    return { lane: 'points', verdict: 'FAIL', allowed: false, headline: 'No award to score.', checks }
  }

  const cpp = cash ? cppForQuotes(cash, award, trip.constraints.partySize) : null
  if (cpp === null) {
    checks.push({
      id: 'cpp',
      label: 'Cents per point',
      verdict: 'MARGINAL',
      detail: 'Need both a cash comp and an award paste. CPP = (cash − taxes/fees) / points.',
      numbers: {
        formula: '(cash − taxes) / points',
        floor: formatCpp(MIN_CPP),
        luxury: `${formatCpp(LUXURY_CPP_TARGET.min)}–${formatCpp(LUXURY_CPP_TARGET.max)}`,
      },
    })
  } else if (cpp < MIN_CPP) {
    checks.push({
      id: 'cpp',
      label: 'Cents per point',
      verdict: 'FAIL',
      detail: `${formatCpp(cpp)} is under the 2¢ floor. Keep the points. Formula: (cash − taxes/fees) / points.`,
      numbers: {
        cpp: formatCpp(cpp),
        floor: formatCpp(MIN_CPP),
        luxury: `${formatCpp(LUXURY_CPP_TARGET.min)}–${formatCpp(LUXURY_CPP_TARGET.max)}`,
        cashParty: cash ? formatUsd(cash.cashUsd * trip.constraints.partySize) : '—',
        taxesParty: formatUsd(award.taxesUsd * trip.constraints.partySize),
        pointsParty: String(award.miles * trip.constraints.partySize),
      },
    })
  } else if (cpp >= LUXURY_CPP_TARGET.min) {
    const band = cpp <= LUXURY_CPP_TARGET.max ? 'inside' : 'above'
    checks.push({
      id: 'cpp',
      label: 'Cents per point',
      verdict: 'PASS',
      detail: `${formatCpp(cpp)} ${band} the 10–25¢ luxury target (floor is 2¢). Formula: (cash − taxes/fees) / points.`,
      numbers: {
        cpp: formatCpp(cpp),
        floor: formatCpp(MIN_CPP),
        luxury: `${formatCpp(LUXURY_CPP_TARGET.min)}–${formatCpp(LUXURY_CPP_TARGET.max)}`,
        cashParty: cash ? formatUsd(cash.cashUsd * trip.constraints.partySize) : '—',
        taxesParty: formatUsd(award.taxesUsd * trip.constraints.partySize),
        pointsParty: String(award.miles * trip.constraints.partySize),
      },
    })
  } else {
    checks.push({
      id: 'cpp',
      label: 'Cents per point',
      verdict: 'MARGINAL',
      detail: `${formatCpp(cpp)} clears the 2¢ floor but sits shy of the 10–25¢ luxury target. Usable, not a trophy.`,
      numbers: {
        cpp: formatCpp(cpp),
        floor: formatCpp(MIN_CPP),
        luxury: `${formatCpp(LUXURY_CPP_TARGET.min)}–${formatCpp(LUXURY_CPP_TARGET.max)}`,
        cashParty: cash ? formatUsd(cash.cashUsd * trip.constraints.partySize) : '—',
        taxesParty: formatUsd(award.taxesUsd * trip.constraints.partySize),
        pointsParty: String(award.miles * trip.constraints.partySize),
      },
    })
  }

  const options = transferOptions({ award, balances, partySize: trip.constraints.partySize })
  const rec = recommendedTransfer(options)
  const oneToOne = options.filter((option) => option.ratio === '1:1')
  if (oneToOne.length === 0) {
    checks.push({
      id: 'transfer',
      label: 'Transfer ratio',
      verdict: 'FAIL',
      detail: `No 1:1 (or better) path into ${award.program}. Worse ratios do not pass.`,
      numbers: { program: award.program, ratio: 'none 1:1' },
    })
  } else {
    const enough = oneToOne.some((option) => option.enough)
    checks.push({
      id: 'transfer',
      label: 'Transfer ratio',
      verdict: enough ? 'PASS' : 'MARGINAL',
      detail: enough
        ? `1:1 path via ${rec?.currencyName ?? 'household currency'} → ${award.program}. Mock-book before a single point moves.`
        : `1:1 path exists into ${award.program}, but the on-hand balance is short of ${award.miles * trip.constraints.partySize} miles for the party.`,
      numbers: {
        ratio: '1:1',
        via: rec?.currencyName ?? '—',
        needed: String(award.miles * trip.constraints.partySize),
        onHand: rec ? String(rec.balance) : '—',
      },
    })
  }

  const booked = mockBookComplete(trip.mockBookChecks)
  checks.push({
    id: 'mock_book',
    label: 'Mock-book before transfer',
    verdict: booked ? 'PASS' : 'MARGINAL',
    detail: booked
      ? 'Mock-book checklist is complete. Transfer is allowed only at 1:1 or better.'
      : 'Checklist is still open. The points lane can be chosen, but no transfer until every mock-book box is ticked.',
    numbers: {
      items: String(MOCK_BOOK_ITEMS.length),
      checked: String(trip.mockBookChecks.filter(Boolean).length),
    },
  })

  const dealChecks = checks.filter((check) => check.id !== 'mock_book')
  const worst = worstVerdict(dealChecks.map((check) => check.verdict))
  const cppCheck = checks.find((check) => check.id === 'cpp')
  const transferCheck = checks.find((check) => check.id === 'transfer')
  const hardFail = cppCheck?.verdict === 'FAIL' || transferCheck?.verdict === 'FAIL'
  const verdict = hardFail ? 'FAIL' : worst
  const allowed = !hardFail && channelCheck.verdict === 'PASS'

  return {
    lane: 'points',
    verdict,
    allowed,
    headline: pointsHeadline(verdict, cpp, award),
    checks,
  }
}

function pointsHeadline(verdict: DealVerdict, cpp: number | null, award: AwardQuote): string {
  const cppText = formatCpp(cpp)
  if (verdict === 'PASS') return `PASS — ${cppText} on ${award.program} (${award.metal || 'award'}), luxury-range.`
  if (verdict === 'MARGINAL') return `MARGINAL — ${cppText} on ${award.program} clears 2¢, shy of 10–25¢.`
  return `FAIL — points lane does not clear the household metrics.`
}

function worstVerdict(verdicts: DealVerdict[]): DealVerdict {
  return verdicts.reduce<DealVerdict>((acc, value) => (RANK[value] < RANK[acc] ? value : acc), 'PASS')
}

function summarize(
  overall: DealVerdict,
  recommended: 'cash' | 'points' | null,
  cash: LaneScore,
  points: LaneScore,
  trip: TripDraft,
): string {
  if (!trip.redemptionChannel) {
    return 'Deal Score is locked until you confirm this is an airline/program redemption — not a portal, gift card, statement credit, or cruise.'
  }
  if (isNeverPassChannel(trip.redemptionChannel)) {
    return 'FAIL. Portal, gift card, statement credit, and cruise-with-flexible-points redemptions never pass this household gate.'
  }
  if (overall === 'FAIL') {
    return `FAIL. ${cash.headline} ${points.headline} Keep hunting — cash vs points stays closed.`
  }
  const rec = recommended === 'points' ? 'Use the points lane next.' : recommended === 'cash' ? 'Use the cash lane next.' : 'No lane recommended.'
  return `${overall}. ${cash.headline} ${points.headline} ${rec}`
}

export function laneById(score: DealScore, lane: 'cash' | 'points'): LaneScore | undefined {
  return score.lanes.find((item) => item.lane === lane)
}
