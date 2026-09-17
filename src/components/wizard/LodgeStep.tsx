import { POLICY } from '../../data/household'
import { formatCpp } from '../../lib/cpp'
import { formatMiles, formatUsd } from '../../lib/format'
import { scoreHyattStay } from '../../lib/hyattScore'
import type { HyattAwards, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  hyattAwards: HyattAwards
  pointsOnHand: number
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

export function LodgeStep({ trip, hyattAwards, pointsOnHand, onChange, onBack, onNext }: Props) {
  const stay = trip.hyattStay
  const score = scoreHyattStay(stay, hyattAwards, pointsOnHand)
  const query = trip.hyattSearch || trip.destination || stay.property || 'luxury hotel'
  const hyattUrl = `https://www.hyatt.com/search/${encodeURIComponent(query)}`
  const dates = trip.timeframe.startDate && trip.timeframe.endDate
    ? `${trip.timeframe.startDate} → ${trip.timeframe.endDate}`
    : `${trip.timeframe.tripLengthDays} nights, dates flexible`

  function patchStay(next: Partial<typeof stay>) {
    onChange({ hyattStay: { ...stay, ...next } })
  }

  return (
    <article className="bubble scout">
      <div className="kicker">Hyatt Globalist stay</div>
      <h2>Score the room like a deal</h2>
      <p className="lede">{POLICY.lodging} Bilt is the Hyatt transfer we protect.</p>
      <p className="hint">Window: {dates}. Points on hand: {formatMiles(pointsOnHand)}. Certs on profile: {hyattAwards.freeNightCerts}. Club awards: {hyattAwards.clubAwards}.</p>

      <div className={`score-hero ${score.verdict.toLowerCase()}`}>
        <div className={`verdict ${score.verdict}`}>{score.verdict}</div>
        <p className="stamp">{score.verdict}</p>
        <p className="hint">{score.headline} · CPP {formatCpp(score.cpp)}</p>
      </div>

      <label className="field">
        Property
        <input value={stay.property} onChange={(e) => patchStay({ property: e.target.value })} placeholder="Grand Hyatt Cairo" />
      </label>
      <label className="field">
        Hyatt search
        <input value={trip.hyattSearch} onChange={(e) => onChange({ hyattSearch: e.target.value })} placeholder="Cairo, Egypt" />
      </label>
      <div className="links">
        <a href={hyattUrl} target="_blank" rel="noreferrer">Open Hyatt search</a>
        <a href="https://www.hyatt.com/" target="_blank" rel="noreferrer">Hyatt home</a>
      </div>

      <div className="choice-grid">
        <button type="button" className={`choice ${stay.isHyatt ? 'selected' : ''}`} onClick={() => patchStay({ isHyatt: true, rareNonHyatt: false })}>
          <strong>Hyatt (house default)</strong>
          <div className="hint">About 98% of stays.</div>
        </button>
        <button type="button" className={`choice ${!stay.isHyatt ? 'selected' : ''}`} onClick={() => patchStay({ isHyatt: false })}>
          <strong>Not Hyatt</strong>
          <div className="hint">Fails Deal Score unless you mark a rare exception.</div>
        </button>
      </div>
      {!stay.isHyatt ? (
        <label className="checklist">
          <span>
            <input type="checkbox" checked={stay.rareNonHyatt} onChange={(e) => patchStay({ rareNonHyatt: e.target.checked })} />
            {' '}Rare exception — still MARGINAL, not a habit.
          </span>
        </label>
      ) : null}

      <div className="field-row">
        <label className="field">Nights<input type="number" min={1} value={stay.nights} onChange={(e) => patchStay({ nights: Number(e.target.value) || 1 })} /></label>
        <label className="field">Category / award type<input value={stay.category} onChange={(e) => patchStay({ category: e.target.value })} placeholder="Cat 4 off-peak" /></label>
      </div>
      <div className="field-row">
        <label className="field">Points / night<input type="number" min={0} value={stay.pointsPerNight || ''} onChange={(e) => patchStay({ pointsPerNight: Number(e.target.value) || 0 })} /></label>
        <label className="field">Cash / night USD<input type="number" min={0} value={stay.cashPerNight || ''} onChange={(e) => patchStay({ cashPerNight: Number(e.target.value) || 0 })} /></label>
      </div>
      <div className="field-row">
        <label className="field">Award taxes / night USD<input type="number" min={0} value={stay.taxesPerNight || ''} onChange={(e) => patchStay({ taxesPerNight: Number(e.target.value) || 0 })} /></label>
        <label className="field">Free-night certs used<input type="number" min={0} max={stay.nights} value={stay.freeNightCertsUsed} onChange={(e) => patchStay({ freeNightCertsUsed: Number(e.target.value) || 0 })} /></label>
      </div>
      <label className="field">
        Club awards used
        <input type="number" min={0} value={stay.clubAwardsUsed} onChange={(e) => patchStay({ clubAwardsUsed: Number(e.target.value) || 0 })} />
      </label>

      <h3>Globalist perks (checklist)</h3>
      <div className="checklist">
        <label>
          <input type="checkbox" checked={stay.clubAccess} onChange={(e) => patchStay({ clubAccess: e.target.checked })} />
          <span>Club access (or breakfast equivalent) in the plan</span>
        </label>
        <label>
          <input type="checkbox" checked={stay.lateCheckout} onChange={(e) => patchStay({ lateCheckout: e.target.checked })} />
          <span>Late checkout when the hotel can do it</span>
        </label>
        <label>
          <input type="checkbox" checked={stay.suiteUpgradeNote} onChange={(e) => patchStay({ suiteUpgradeNote: e.target.checked })} />
          <span>Suite upgrade is informational only — possible, never promised</span>
        </label>
      </div>

      <div className="table-like" style={{ marginTop: 12 }}>
        {score.checks.map((check) => (
          <div key={check.id} className="check-row">
            <span className={`verdict ${check.verdict}`}>{check.verdict}</span>
            <div>
              <strong>{check.label}</strong>
              <div className="hint">{check.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="hint">Paid nights {score.paidNights} · points needed {formatMiles(score.pointsNeeded)} · cash room value {formatUsd(score.cashEquivalent)}.</p>

      <label className="field">
        Lodging notes
        <textarea
          value={trip.lodgingNotes}
          onChange={(e) => onChange({ lodgingNotes: e.target.value })}
          placeholder="Andaz if dates line up. Award nights only if CPP clears 2¢."
        />
      </label>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" onClick={onNext}>Ask Chief of Staff</button>
      </div>
    </article>
  )
}
