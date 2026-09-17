import { POLICY } from '../../data/household'
import type { TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

export function LodgeStep({ trip, onChange, onBack, onNext }: Props) {
  const query = trip.hyattSearch || trip.destination || 'luxury hotel'
  const hyattUrl = `https://www.hyatt.com/search/${encodeURIComponent(query)}`
  const dates = trip.timeframe.startDate && trip.timeframe.endDate
    ? `${trip.timeframe.startDate} → ${trip.timeframe.endDate}`
    : `${trip.timeframe.tripLengthDays} nights, dates flexible`

  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>Where you sleep</h2>
      <p className="lede">{POLICY.lodging}</p>
      <p className="banner ok">Bilt is the Hyatt transfer we protect. Amex Membership Rewards does the airline work when both can move 1:1.</p>
      <p className="hint">Window: {dates}. Status: Globalist.</p>
      <label className="field">
        Hyatt search
        <input value={trip.hyattSearch} onChange={(e) => onChange({ hyattSearch: e.target.value })} placeholder="Cairo, Egypt" />
      </label>
      <div className="links">
        <a href={hyattUrl} target="_blank" rel="noreferrer">Open Hyatt search</a>
        <a href="https://www.hyatt.com/" target="_blank" rel="noreferrer">Hyatt home</a>
      </div>
      <label className="field">
        Lodging notes (cash vs points, property names)
        <textarea
          value={trip.lodgingNotes}
          onChange={(e) => onChange({ lodgingNotes: e.target.value })}
          placeholder="Grand Hyatt / Andaz if the dates work. Award nights only if CPP clears 2¢."
        />
      </label>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" onClick={onNext}>Ask Chief of Staff</button>
      </div>
    </article>
  )
}
