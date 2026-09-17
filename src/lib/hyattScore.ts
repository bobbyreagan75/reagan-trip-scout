import { LUXURY_CPP_TARGET, MIN_CPP } from '../data/household'
import type { DealVerdict, HyattAwards, HyattStay } from '../types'
import { centsPerPoint, formatCpp } from './cpp'
import { formatMiles, formatUsd } from './format'

export type HyattScore = {
  verdict: DealVerdict
  headline: string
  cpp: number | null
  paidNights: number
  pointsNeeded: number
  cashEquivalent: number
  enoughPoints: boolean
  checks: { id: string; verdict: DealVerdict; label: string; detail: string }[]
}

export function scoreHyattStay(stay: HyattStay, awards: HyattAwards, pointsOnHand: number): HyattScore {
  const certs = Math.min(Math.max(0, stay.freeNightCertsUsed), stay.nights)
  const paidNights = Math.max(0, stay.nights - certs)
  const pointsNeeded = paidNights * stay.pointsPerNight
  const cashEquivalent = stay.nights * stay.cashPerNight
  const awardTaxes = paidNights * stay.taxesPerNight
  const cpp = pointsNeeded > 0
    ? centsPerPoint(paidNights * stay.cashPerNight, pointsNeeded, awardTaxes)
    : null
  const checks: HyattScore['checks'] = []

  if (!stay.isHyatt && !stay.rareNonHyatt) {
    checks.push({
      id: 'brand',
      verdict: 'FAIL',
      label: 'Hyatt bias',
      detail: 'This household sleeps Hyatt about 98% of the time. A non-Hyatt stay fails unless you mark a rare exception.',
    })
  } else if (!stay.isHyatt && stay.rareNonHyatt) {
    checks.push({
      id: 'brand',
      verdict: 'MARGINAL',
      label: 'Hyatt bias',
      detail: 'Rare non-Hyatt exception noted. Globalist perks and Bilt→Hyatt do not travel with you.',
    })
  } else {
    checks.push({
      id: 'brand',
      verdict: 'PASS',
      label: 'Hyatt bias',
      detail: 'Hyatt Globalist default. Club access and late checkout are the house rhythm.',
    })
  }

  if (stay.freeNightCertsUsed > awards.freeNightCerts) {
    checks.push({
      id: 'certs',
      verdict: 'MARGINAL',
      label: 'Free-night certificates',
      detail: `Scoring ${stay.freeNightCertsUsed} certs but the profile only lists ${awards.freeNightCerts}. Update Settings or use fewer.`,
    })
  } else if (certs > 0) {
    checks.push({
      id: 'certs',
      verdict: 'PASS',
      label: 'Free-night certificates',
      detail: `${certs} night${certs === 1 ? '' : 's'} covered by certificates — those nights skip the points pile.`,
    })
  }

  if (stay.clubAwardsUsed > awards.clubAwards) {
    checks.push({
      id: 'club_award',
      verdict: 'MARGINAL',
      label: 'Club awards',
      detail: `Using ${stay.clubAwardsUsed} club awards vs ${awards.clubAwards} on the profile.`,
    })
  } else if (stay.clubAwardsUsed > 0) {
    checks.push({
      id: 'club_award',
      verdict: 'PASS',
      label: 'Club awards',
      detail: 'Club award applied. Globalist often has club or breakfast already — confirm the property.',
    })
  }

  checks.push({
    id: 'suite',
    verdict: 'PASS',
    label: 'Suite upgrade (informational)',
    detail: stay.suiteUpgradeNote
      ? 'Globalist suite upgrades are a maybe, never a promise. Confirm at arrival; do not pay extra “for the chance.”'
      : 'Suite upgrade not in the plan.',
  })
  checks.push({
    id: 'club',
    verdict: stay.clubAccess ? 'PASS' : 'MARGINAL',
    label: 'Club access',
    detail: stay.clubAccess
      ? 'Club (or Globalist breakfast equivalent) is in the plan.'
      : 'No club expected — fine if the property has none.',
  })
  checks.push({
    id: 'late',
    verdict: stay.lateCheckout ? 'PASS' : 'MARGINAL',
    label: 'Late checkout',
    detail: stay.lateCheckout
      ? 'Late checkout is the house default when the hotel can do it.'
      : 'Early out — only if the flight forces it.',
  })

  if (paidNights === 0 && stay.nights > 0) {
    checks.push({
      id: 'cpp',
      verdict: 'PASS',
      label: 'Stay CPP',
      detail: 'Certificates cover every night. Points stay in the account.',
    })
  } else if (!stay.pointsPerNight || !stay.cashPerNight) {
    checks.push({
      id: 'cpp',
      verdict: 'MARGINAL',
      label: 'Stay CPP',
      detail: 'Paste cash per night and points per night to score against the 2¢ floor.',
    })
  } else if (cpp !== null && cpp < MIN_CPP) {
    checks.push({
      id: 'cpp',
      verdict: 'FAIL',
      label: 'Stay CPP',
      detail: `${formatCpp(cpp)} is under 2¢. Pay cash for the room or pick another Hyatt. Formula: (cash − award taxes) / points.`,
    })
  } else if (cpp !== null && cpp >= LUXURY_CPP_TARGET.min) {
    checks.push({
      id: 'cpp',
      verdict: 'PASS',
      label: 'Stay CPP',
      detail: `${formatCpp(cpp)} hits the luxury band. ${formatUsd(stay.cashPerNight)} cash vs ${formatMiles(stay.pointsPerNight)} points per paid night.`,
    })
  } else {
    checks.push({
      id: 'cpp',
      verdict: 'MARGINAL',
      label: 'Stay CPP',
      detail: `${formatCpp(cpp)} clears 2¢ but is shy of 10–25¢. Usable on Hyatt; not a trophy.`,
    })
  }

  const enoughPoints = pointsOnHand >= pointsNeeded
  if (pointsNeeded > 0) {
    checks.push({
      id: 'balance',
      verdict: enoughPoints ? 'PASS' : 'FAIL',
      label: 'Hyatt points on hand',
      detail: enoughPoints
        ? `${formatMiles(pointsOnHand)} on hand covers ${formatMiles(pointsNeeded)} needed (Bilt is the transfer we protect).`
        : `Need ${formatMiles(pointsNeeded)}; on hand ${formatMiles(pointsOnHand)}. Transfer from Bilt only after a hold, 1:1.`,
    })
  }

  const hard = checks.some((c) => (c.id === 'brand' || c.id === 'cpp' || c.id === 'balance') && c.verdict === 'FAIL')
  const cppCheck = checks.find((c) => c.id === 'cpp')
  const brandCheck = checks.find((c) => c.id === 'brand')
  let verdict: DealVerdict = 'PASS'
  if (hard) verdict = 'FAIL'
  else if (checks.some((c) => c.verdict === 'MARGINAL') || cppCheck?.verdict === 'MARGINAL' || brandCheck?.verdict === 'MARGINAL') {
    verdict = 'MARGINAL'
  }

  const headline = stay.isHyatt || stay.rareNonHyatt
    ? `${verdict} — ${paidNights} paid night${paidNights === 1 ? '' : 's'} · ${formatCpp(cpp)} · ${formatMiles(pointsNeeded)} points`
    : 'FAIL — not Hyatt, and no rare exception marked.'

  return {
    verdict,
    headline,
    cpp,
    paidNights,
    pointsNeeded,
    cashEquivalent,
    enoughPoints,
    checks,
  }
}
