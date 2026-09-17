import { AIRPORTS, POLICY } from '../../data/household'
import type { Cabin, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

const CABINS: { id: Cabin; label: string; note: string }[] = [
  { id: 'business_or_first', label: 'Business / first', note: 'International default. Hourly cash ceiling $90 one-way.' },
  { id: 'premium_economy', label: 'Premium economy', note: 'Only if the lie-flat inventory is truly ugly. Ceiling $60/hour.' },
  { id: 'coach', label: 'Coach', note: 'Domestic cash hopper, not the long-haul plan. Ceiling $30/hour.' },
]

export function ConstraintsStep({ trip, onChange, onBack, onNext }: Props) {
  const c = trip.constraints
  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>Any constraints?</h2>
      <p className="lede">{POLICY.schedule} Party defaults to the two of you.</p>

      <label className="field">
        Party size
        <input
          type="number"
          min={1}
          max={6}
          value={c.partySize}
          onChange={(e) => onChange({ constraints: { ...c, partySize: Number(e.target.value) || 2 } })}
        />
      </label>

      <div className="choice-grid">
        {CABINS.map((cabin) => (
          <button
            key={cabin.id}
            type="button"
            className={`choice ${c.cabin === cabin.id ? 'selected' : ''}`}
            onClick={() => onChange({ constraints: { ...c, cabin: cabin.id } })}
          >
            <strong>{cabin.label}</strong>
            <div className="hint">{cabin.note}</div>
          </button>
        ))}
      </div>

      <div className="choice-grid">
        <button
          type="button"
          className={`choice ${c.dislikeEarly ? 'selected' : ''}`}
          onClick={() => onChange({ constraints: { ...c, dislikeEarly: !c.dislikeEarly } })}
        >
          <strong>Skip early departures when similar</strong>
          <div className="hint">Dawn flights are a last resort, not a lifestyle.</div>
        </button>
        <button
          type="button"
          className={`choice ${c.lateOk ? 'selected' : ''}`}
          onClick={() => onChange({ constraints: { ...c, lateOk: !c.lateOk } })}
        >
          <strong>Late flights are fine</strong>
          <div className="hint">Evening wheels-up from {trip.isDomestic ? AIRPORTS.domesticHome : AIRPORTS.internationalPosition} is welcome.</div>
        </button>
      </div>

      <p className="hint">{POLICY.cashCeilings}</p>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" onClick={onNext}>
          {trip.isDomestic ? 'Open the cash path' : 'Hunt cash and points'}
        </button>
      </div>
    </article>
  )
}
