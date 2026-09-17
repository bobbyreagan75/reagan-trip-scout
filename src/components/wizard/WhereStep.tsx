import { AIRPORTS, POLICY } from '../../data/household'
import { DESTINATION_SUGGESTIONS } from '../../data/destinations'
import { resolveDomestic } from '../../lib/domestic'
import type { TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  onChange: (patch: Partial<TripDraft>) => void
  onNext: () => void
}

export function WhereStep({ trip, onChange, onNext }: Props) {
  function setDestination(destination: string, mode: TripDraft['destinationMode'] = trip.destinationMode) {
    const isDomestic = resolveDomestic(destination, mode, trip.domesticOverride ? trip.isDomestic : undefined)
    onChange({
      destination,
      destinationMode: mode,
      isDomestic: mode === 'deal_first' ? false : isDomestic,
      hyattSearch: destination,
      demoLabel: null,
    })
  }

  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>Where do you want to go?</h2>
      <p className="lede">{POLICY.dealFirst}</p>

      <div className="choice-grid">
        <button
          type="button"
          className={`choice ${trip.destinationMode === 'deal_first' ? 'selected' : ''}`}
          onClick={() => setDestination(trip.destination || 'Anywhere luxury', 'deal_first')}
        >
          <strong>Deal-first / anywhere luxury</strong>
          <div className="hint">Destination can wait. We hunt the cabin and the room, then pick a city.</div>
        </button>
        <button
          type="button"
          className={`choice ${trip.destinationMode === 'specific' ? 'selected' : ''}`}
          onClick={() => setDestination(trip.destination, 'specific')}
        >
          <strong>We have a city in mind</strong>
          <div className="hint">Still luxury-first — just starting with a place.</div>
        </button>
      </div>

      {trip.destinationMode === 'specific' ? (
        <>
          <label className="field" style={{ marginTop: 14 }}>
            City or airport
            <input
              value={trip.destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Cairo, Egypt"
            />
          </label>
          <div className="links">
            {DESTINATION_SUGGESTIONS.map((item) => (
              <button key={item.label} type="button" onClick={() => setDestination(item.label, 'specific')}>
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="banner cash">{POLICY.pointsLane} Explore from {AIRPORTS.internationalPosition}.</p>
      )}

      <fieldset className="card" style={{ marginTop: 12, border: 0 }}>
        <legend className="muted">Lane</legend>
        <p className="hint">{POLICY.domesticCash}</p>
        <div className="who">
          <button
            type="button"
            className={!trip.isDomestic ? 'selected' : ''}
            onClick={() => onChange({ isDomestic: false, domesticOverride: true })}
          >
            International · points allowed
          </button>
          <button
            type="button"
            className={trip.isDomestic ? 'selected' : ''}
            onClick={() => onChange({ isDomestic: true, domesticOverride: true, destinationMode: 'specific' })}
          >
            U.S. domestic · cash only
          </button>
        </div>
        {trip.isDomestic ? (
          <p className="banner cash">Domestic hops home out of {AIRPORTS.domesticHome}. Points stay in the account.</p>
        ) : (
          <p className="banner ok">International positioning through {AIRPORTS.internationalPosition}. {POLICY.airports}</p>
        )}
      </fieldset>

      <div className="progress-actions">
        <span />
        <button className="btn" type="button" disabled={trip.destinationMode === 'specific' && !trip.destination.trim()} onClick={onNext}>
          Next: timeframe
        </button>
      </div>
    </article>
  )
}
