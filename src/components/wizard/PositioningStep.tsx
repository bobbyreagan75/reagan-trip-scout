import { AIRPORTS, POLICY } from '../../data/household'
import { DAYPARTS } from '../../data/positioning'
import { isEarlyDaypart, orfToGatewayUrl, positioningHint, positioningReady, toggleBackup, POSITION_BACKUPS, POSITION_PRIMARY } from '../../lib/positioning'
import type { Daypart, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

export function PositioningStep({ trip, onChange, onBack, onNext }: Props) {
  const pos = trip.positioning
  const ready = positioningReady(pos, trip.isDomestic)
  const early = isEarlyDaypart(pos.daypart)
  const date = trip.timeframe.startDate

  function setBackups(code: string) {
    onChange({ positioning: { ...pos, backups: toggleBackup(pos.backups, code) } })
  }

  if (trip.isDomestic) {
    return (
      <article className="bubble scout">
        <div className="kicker">Positioning</div>
        <h2>ORF is already home</h2>
        <p className="lede">{POLICY.domesticCash} No hop to IAD. Later wheels-up from Norfolk still preferred.</p>
        <p className="banner cash">Domestic cash path from {AIRPORTS.domesticHome}. Google Flights stays on the next step.</p>
        <div className="progress-actions">
          <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
          <button className="btn" type="button" onClick={onNext}>Continue to cash search</button>
        </div>
      </article>
    )
  }

  return (
    <article className="bubble scout">
      <div className="kicker">ORF positioning</div>
      <h2>Get to the long-haul gateway</h2>
      <p className="lede">
        International metal is hunted from {POSITION_PRIMARY}. Norfolk ({AIRPORTS.domesticHome}) is a cash hop —
        same domestic-cash rule. Pick 2–3 backup gateways so one cancellation does not kill the trip.
      </p>
      <p className="banner ok">Primary: {AIRPORTS.domesticHome} → {pos.primary || POSITION_PRIMARY}. {POLICY.schedule}</p>

      <h3>Backup gateways (pick 2–3)</h3>
      <div className="chip-row">
        {POSITION_BACKUPS.map((code) => (
          <button
            key={code}
            type="button"
            className={`choice ${pos.backups.includes(code) ? 'selected' : ''}`}
            onClick={() => setBackups(code)}
          >
            <strong>{AIRPORTS.domesticHome} → {code}</strong>
            <div className="hint">{code === 'JFK' || code === 'EWR' || code === 'BOS' ? 'Often useful when IAD is ugly.' : 'Keep in the mix.'}</div>
          </button>
        ))}
      </div>
      <p className={`banner ${ready ? 'ok' : 'warn'}`}>{positioningHint(pos, false)}</p>

      <h3>When to leave Norfolk</h3>
      <div className="chip-row">
        {DAYPARTS.map((part) => (
          <button
            key={part.id}
            type="button"
            className={`choice ${pos.daypart === part.id ? 'selected' : ''}`}
            onClick={() => onChange({ positioning: { ...pos, daypart: part.id as Daypart } })}
          >
            <strong>{part.label}</strong>
            <div className="hint">{part.flag === 'avoid' ? 'Flag — skip when a later option is similar.' : part.flag === 'caution' ? 'Early-ish. Only if nothing later works.' : 'Fits the house clock.'}</div>
          </button>
        ))}
      </div>
      {early ? <p className="banner warn">Early morning from ORF is flagged. If two routings look similar, take the later one.</p> : null}

      <h3>Google Flights — cash hops from ORF</h3>
      <p className="hint">Domestic cash is allowed. Open a tab per gateway, paste the fare on Search if you want it in the brief.</p>
      <div className="links">
        <a href={orfToGatewayUrl(pos.primary || POSITION_PRIMARY, date, trip.constraints.partySize)} target="_blank" rel="noreferrer">
          {AIRPORTS.domesticHome} → {pos.primary || POSITION_PRIMARY}
        </a>
        {pos.backups.map((code) => (
          <a key={code} href={orfToGatewayUrl(code, date, trip.constraints.partySize)} target="_blank" rel="noreferrer">
            {AIRPORTS.domesticHome} → {code}
          </a>
        ))}
      </div>

      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" disabled={!ready} onClick={onNext}>
          {ready ? 'Continue to long-haul search' : 'Select 2–3 backups'}
        </button>
      </div>
    </article>
  )
}
