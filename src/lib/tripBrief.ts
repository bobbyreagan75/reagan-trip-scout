import { AIRPORTS, APP_NAME, COS_EMAIL, HOUSEHOLD, POLICY } from '../data/household'
import { cppForQuotes, formatCpp } from './cpp'
import { ceilingForQuote } from './ceilings'
import { scoreDeal } from './dealScore'
import { recommendedTransfer, transferOptions } from './transfers'
import type { BalanceRow, DealVerdict, TripDraft } from '../types'
import { flightOrigin } from './tripDefaults'

export type TripBrief = {
  generatedAt: string
  app: string
  household: string
  askedBy: string
  destination: string
  mode: string
  domestic: boolean
  timeframe: TripDraft['timeframe']
  constraints: TripDraft['constraints']
  origin: string
  gateways: string[]
  payWith: string | null
  cashQuotes: TripDraft['cashQuotes']
  awardQuotes: TripDraft['awardQuotes']
  lodging: { hyattDefault: true; notes: string; search: string }
  cpp: string | null
  transfer: ReturnType<typeof recommendedTransfer> | null
  cashCeilingUsd: number | null
  dealScore: {
    overall: DealVerdict
    recommended: 'cash' | 'points' | null
    canProceedToPay: boolean
    canBookPoints: boolean
    lanes: { lane: 'cash' | 'points'; verdict: DealVerdict; allowed: boolean; headline: string }[]
  }
  householdRules: string[]
  nextAsks: string[]
}

export function buildTripBrief(trip: TripDraft, balances: BalanceRow[], askedBy: string): TripBrief {
  const origin = flightOrigin(trip.isDomestic)
  const cash = trip.cashQuotes.find((q) => q.id === trip.selectedCashId) ?? trip.cashQuotes[0]
  const award = trip.awardQuotes.find((q) => q.id === trip.selectedAwardId) ?? trip.awardQuotes[0]
  const cpp = cash && award ? cppForQuotes(cash, award, trip.constraints.partySize) : null
  const transfer = award
    ? recommendedTransfer(transferOptions({ award, balances, partySize: trip.constraints.partySize }))
    : undefined

  const deal = scoreDeal(trip, balances)

  return {
    generatedAt: new Date().toISOString(),
    app: APP_NAME,
    household: HOUSEHOLD,
    askedBy,
    destination: trip.destinationMode === 'deal_first' ? 'Deal-first / anywhere luxury' : trip.destination,
    mode: trip.destinationMode,
    domestic: trip.isDomestic,
    timeframe: trip.timeframe,
    constraints: trip.constraints,
    origin,
    gateways: trip.isDomestic ? [AIRPORTS.domesticHome] : [AIRPORTS.internationalPosition, ...AIRPORTS.alsoOkGateways],
    payWith: trip.payWith,
    cashQuotes: trip.cashQuotes,
    awardQuotes: trip.awardQuotes,
    lodging: { hyattDefault: true, notes: trip.lodgingNotes, search: trip.hyattSearch || trip.destination },
    cpp: cpp === null ? null : formatCpp(cpp),
    transfer: transfer ?? null,
    cashCeilingUsd: cash ? ceilingForQuote(cash) : null,
    dealScore: {
      overall: deal.overall,
      recommended: deal.recommended,
      canProceedToPay: deal.canProceedToPay,
      canBookPoints: deal.canBookPoints,
      lanes: deal.lanes.map((lane) => ({
        lane: lane.lane,
        verdict: lane.verdict,
        allowed: lane.allowed,
        headline: lane.headline,
      })),
    },
    householdRules: Object.values(POLICY),
    nextAsks: nextAsks(trip),
  }
}

export function humanTripBrief(brief: TripBrief): string {
  const lines = [
    `${brief.app} — trip brief for ${brief.household}`,
    `Asked by: ${brief.askedBy}`,
    `Generated: ${brief.generatedAt}`,
    '',
    `Destination: ${brief.destination}${brief.domestic ? ' (U.S. domestic — cash only)' : ' (international)'}`,
    `Origin bias: ${brief.origin} (also ${brief.gateways.join(', ')})`,
    `Party: ${brief.constraints.partySize} · Cabin goal: ${brief.constraints.cabin.replaceAll('_', ' ')}`,
    `Length: ${brief.timeframe.tripLengthDays} nights · Flexible: ${brief.timeframe.flexible ? 'yes' : 'no'} ±${brief.timeframe.plusMinusDays} days`,
    `Dates: ${brief.timeframe.startDate || 'open'} → ${brief.timeframe.endDate || 'open'}`,
    `Early flights: ${brief.constraints.dislikeEarly ? 'avoid when similar' : 'ok'} · Late: ${brief.constraints.lateOk ? 'ok' : 'prefer earlier'}`,
    `Pay with: ${brief.payWith ?? 'not chosen yet'}`,
    brief.cpp ? `CPP vs cash: ${brief.cpp}` : '',
    brief.cashCeilingUsd != null ? `Cash ceiling (selected fare hours): $${brief.cashCeilingUsd.toLocaleString('en-US')}` : '',
    `Deal Score: ${brief.dealScore.overall}${brief.dealScore.recommended ? ` · recommended ${brief.dealScore.recommended}` : ''}`,
    ...brief.dealScore.lanes.map((lane) => `  - ${lane.lane}: ${lane.verdict} — ${lane.headline}`),
    '',
    'Cash quotes:',
    ...brief.cashQuotes.map((q) =>
      `  - ${q.sample ? 'SAMPLE · ' : ''}${q.airline} ${q.origin}→${q.destination} $${q.cashUsd.toLocaleString('en-US')} pp · ${q.hoursOneWay || '?'}h · ${q.depart || 'dates TBD'}`,
    ),
    '',
    'Award quotes:',
    ...brief.awardQuotes.map((q) =>
      `  - ${q.sample ? 'SAMPLE · ' : ''}${q.metal} on ${q.program}: ${q.miles.toLocaleString('en-US')} miles + $${q.taxesUsd} tax pp · ${q.seats} seats`,
    ),
    '',
    brief.transfer
      ? `Transfer path: ${brief.transfer.currencyName} → ${brief.transfer.program} at 1:1 · need ${brief.transfer.milesNeeded.toLocaleString('en-US')} · on-hand ${brief.transfer.balance.toLocaleString('en-US')}`
      : 'Transfer path: none yet',
    `Lodging: Hyatt Globalist default. ${brief.lodging.notes || 'No hotel notes yet.'}`,
    '',
    'Please keep hunting with these household rules in mind, then reply with options:',
    ...brief.nextAsks.map((ask) => `  • ${ask}`),
  ]
  return lines.filter((line) => line !== '').join('\n')
}

export function chiefOfStaffMailto(brief: TripBrief, summary: string): string {
  const subject = `${brief.app}: ${brief.destination}`
  const body = `${summary}\n\n---\nJSON brief (paste back into chat if this email truncates):\n${JSON.stringify(brief, null, 2)}`
  const url = new URL(`mailto:${COS_EMAIL}`)
  url.searchParams.set('subject', subject)
  url.searchParams.set('body', body.slice(0, 1800))
  return url.toString()
}

function nextAsks(trip: TripDraft): string[] {
  const asks = [
    'Confirm whether this is still the destination, or switch to a better luxury deal.',
    'Hold or mock-book any award before transferring a single point.',
  ]
  if (trip.redemptionChannel && trip.redemptionChannel !== 'airline_or_program') {
    asks.unshift('This redemption type never passes the household Deal Score. Switch to an airline ticket or program award.')
  }
  if (trip.isDomestic) {
    asks.unshift('Stay on cash for this U.S. domestic routing. Points fail Deal Score here.')
  } else {
    asks.unshift('Run Deal Score before cash vs points. Prefer Amex Membership Rewards before Bilt when both transfer.')
  }
  asks.push('Keep lodging on Hyatt Globalist unless there is a rare reason not to.')
  if (trip.cashQuotes.some((q) => q.sample) || trip.awardQuotes.some((q) => q.sample)) {
    asks.push('Replace SAMPLE placeholder fares with live pasted numbers from Google Flights / seats.aero.')
  }
  return asks
}
