import { POLICY } from '../../data/household'
import type { TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

export function WhenStep({ trip, onChange, onBack, onNext }: Props) {
  const tf = trip.timeframe
  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>What is the timeframe?</h2>
      <p className="lede">{POLICY.calendar}</p>

      <div className="choice-grid">
        <button
          type="button"
          className={`choice ${tf.flexible ? 'selected' : ''}`}
          onClick={() => onChange({ timeframe: { ...tf, flexible: true } })}
        >
          <strong>Flexible dates</strong>
          <div className="hint">Move ±{tf.plusMinusDays} days around a window if it buys a better cabin.</div>
        </button>
        <button
          type="button"
          className={`choice ${!tf.flexible ? 'selected' : ''}`}
          onClick={() => onChange({ timeframe: { ...tf, flexible: false } })}
        >
          <strong>Pinned dates</strong>
          <div className="hint">Still 10–14 nights unless you say otherwise.</div>
        </button>
      </div>

      <div className="field-row" style={{ marginTop: 14 }}>
        <label className="field">
          Outbound
          <input type="date" value={tf.startDate} onChange={(e) => onChange({ timeframe: { ...tf, startDate: e.target.value } })} />
        </label>
        <label className="field">
          Return
          <input type="date" value={tf.endDate} onChange={(e) => onChange({ timeframe: { ...tf, endDate: e.target.value } })} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          Trip length (nights)
          <input
            type="number"
            min={3}
            max={30}
            value={tf.tripLengthDays}
            onChange={(e) => onChange({ timeframe: { ...tf, tripLengthDays: Number(e.target.value) || 12 } })}
          />
        </label>
        <label className="field">
          ± days
          <input
            type="number"
            min={0}
            max={14}
            value={tf.plusMinusDays}
            onChange={(e) => onChange({ timeframe: { ...tf, plusMinusDays: Number(e.target.value) || 0 } })}
          />
        </label>
      </div>
      <p className="hint">Default stay is 10–14 nights. U.S. summer is a last resort, not a plan.</p>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" onClick={onNext}>Next: party &amp; cabin</button>
      </div>
    </article>
  )
}
