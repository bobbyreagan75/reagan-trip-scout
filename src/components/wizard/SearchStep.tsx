import { useState } from 'react'
import { AIRPORTS, POLICY } from '../../data/household'
import { suggestAirportForDestination } from '../../data/destinations'
import { ceilingForQuote, quoteExceedsCeiling } from '../../lib/ceilings'
import { formatUsd, newId } from '../../lib/format'
import { googleFlightsExploreUrl, googleFlightsSearchUrl, kayakExploreUrl } from '../../lib/googleFlights'
import { seatsAeroExplorerUrl, seatsAeroSearchUrl, trySeatsAeroFetch } from '../../lib/seatsAero'
import { flightOrigin } from '../../lib/tripDefaults'
import type { AwardQuote, Cabin, CashQuote, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  seatsApiKey: string
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
  onSaveWatch?: () => void
}

const EMPTY_CASH: Omit<CashQuote, 'id'> = {
  sample: false,
  airline: '',
  origin: '',
  destination: '',
  depart: '',
  returnDate: '',
  cabin: 'business_or_first',
  cashUsd: 0,
  hoursOneWay: 0,
  notes: '',
}

const EMPTY_AWARD: Omit<AwardQuote, 'id'> = {
  sample: false,
  program: '',
  metal: '',
  origin: '',
  destination: '',
  depart: '',
  returnDate: '',
  cabin: 'business_or_first',
  miles: 0,
  taxesUsd: 0,
  seats: 2,
  notes: '',
}

export function SearchStep({ trip, seatsApiKey, onChange, onBack, onNext, onSaveWatch }: Props) {
  const origin = flightOrigin(trip.isDomestic)
  const destCode = trip.destinationMode === 'deal_first'
    ? 'anywhere'
    : suggestAirportForDestination(trip.destination, trip.isDomestic)
  const [cashForm, setCashForm] = useState<Omit<CashQuote, 'id'>>({
    ...EMPTY_CASH,
    origin,
    destination: destCode === 'anywhere' ? '' : destCode,
    depart: trip.timeframe.startDate,
    returnDate: trip.timeframe.endDate,
    cabin: trip.constraints.cabin,
  })
  const [awardForm, setAwardForm] = useState<Omit<AwardQuote, 'id'>>({
    ...EMPTY_AWARD,
    origin,
    destination: destCode === 'anywhere' ? '' : destCode,
    depart: trip.timeframe.startDate,
    returnDate: trip.timeframe.endDate,
    cabin: trip.constraints.cabin,
    seats: trip.constraints.partySize,
  })
  const [apiNote, setApiNote] = useState('')
  const [watchNote, setWatchNote] = useState('')

  const gfSearch = destCode === 'anywhere'
    ? googleFlightsExploreUrl(origin, trip.timeframe.startDate)
    : googleFlightsSearchUrl({
      origin,
      destination: destCode,
      startDate: trip.timeframe.startDate,
      endDate: trip.timeframe.endDate,
      cabin: trip.constraints.cabin,
      partySize: trip.constraints.partySize,
    })

  const canContinue = trip.isDomestic ? trip.cashQuotes.length > 0 : trip.cashQuotes.length + trip.awardQuotes.length > 0

  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>{trip.isDomestic ? 'Cash path — Google Flights' : 'Hunt the metal, then the money'}</h2>
      {trip.demoLabel ? <div className="banner sample">{trip.demoLabel}. SAMPLE award/cash figures are editable placeholders, not live inventory.</div> : null}
      {trip.isDomestic ? (
        <p className="banner cash">{POLICY.domesticCash}</p>
      ) : (
        <p className="lede">Open Google Flights and seats.aero, then paste what you actually see. This prototype does not scrape either site.</p>
      )}

      <div className="links">
        <a href={gfSearch} target="_blank" rel="noreferrer">Open Google Flights {destCode === 'anywhere' ? 'Explore' : 'route search'}</a>
        <a href={googleFlightsExploreUrl(origin, trip.timeframe.startDate)} target="_blank" rel="noreferrer">Google Flights Explore</a>
        <a href={kayakExploreUrl(origin)} target="_blank" rel="noreferrer">Kayak Explore</a>
        {!trip.isDomestic && destCode !== 'anywhere' ? (
          <a href={seatsAeroSearchUrl({ origin, destination: destCode, cabin: trip.constraints.cabin })} target="_blank" rel="noreferrer">
            Open seats.aero search
          </a>
        ) : null}
        {!trip.isDomestic ? (
          <a href={seatsAeroExplorerUrl(origin)} target="_blank" rel="noreferrer">seats.aero from {origin}</a>
        ) : null}
        {onSaveWatch ? (
          <button type="button" onClick={() => { onSaveWatch(); setWatchNote('Route saved under Watch. Notify is copy + mailto — no live scrape.') }}>Save route to watchlist</button>
        ) : null}
      </div>
      {watchNote ? <p className="banner ok">{watchNote}</p> : null}
      <p className="hint">
        Origin bias: {origin}.
        {!trip.isDomestic ? ` Positioning ${trip.positioning.primary} + backups ${trip.positioning.backups.join(', ') || '(none)'}.` : ` Home ${AIRPORTS.domesticHome}.`}
      </p>

      <h3 style={{ marginTop: 18 }}>Paste a cash fare</h3>
      <CashForm value={cashForm} onChange={setCashForm} onAdd={() => {
        const quote: CashQuote = { ...cashForm, id: newId('cash') }
        onChange({ cashQuotes: [...trip.cashQuotes, quote], selectedCashId: quote.id })
        setCashForm({ ...cashForm, airline: '', cashUsd: 0, notes: '' })
      }} />

      <div className="table-like">
        {trip.cashQuotes.map((quote) => (
          <button
            key={quote.id}
            type="button"
            className={`quote ${trip.selectedCashId === quote.id ? 'selected' : ''}`}
            onClick={() => onChange({ selectedCashId: quote.id })}
          >
            <header>
              <strong>{quote.airline || 'Cash fare'}</strong>
              {quote.sample ? <span className="tag">SAMPLE</span> : null}
            </header>
            <div>{quote.origin} → {quote.destination} · {formatUsd(quote.cashUsd)} pp</div>
            <div className="hint">
              {quote.hoursOneWay ? `${quote.hoursOneWay}h block` : 'hours unknown'} · ceiling {ceilingForQuote(quote) != null ? formatUsd(ceilingForQuote(quote)!) : '—'}
              {quoteExceedsCeiling(quote) ? ' · over household cash ceiling' : ''}
            </div>
            {quote.notes ? <div className="hint">{quote.notes}</div> : null}
          </button>
        ))}
      </div>

      {!trip.isDomestic ? (
        <>
          <hr className="rule" />
          <h3>Paste an award (miles, taxes, program, seats)</h3>
          <p className="hint">Use clearly labeled SAMPLE figures until you replace them with a real seats.aero paste.</p>
          <AwardForm value={awardForm} onChange={setAwardForm} onAdd={() => {
            const quote: AwardQuote = { ...awardForm, id: newId('award') }
            onChange({ awardQuotes: [...trip.awardQuotes, quote], selectedAwardId: quote.id })
            setAwardForm({ ...awardForm, program: '', metal: '', miles: 0, notes: '' })
          }} />
          {seatsApiKey ? (
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                void trySeatsAeroFetch(seatsApiKey, origin, destCode === 'anywhere' ? 'CAI' : destCode).then((result) => {
                  setApiNote(result.ok ? result.preview : result.reason)
                })
              }}
            >
              Try seats.aero API hook
            </button>
          ) : <p className="hint">No seats.aero API key in Settings — paste-back is the v1 path.</p>}
          {apiNote ? <pre className="pre">{apiNote}</pre> : null}
          <div className="table-like">
            {trip.awardQuotes.map((quote) => (
              <button
                key={quote.id}
                type="button"
                className={`quote ${trip.selectedAwardId === quote.id ? 'selected' : ''}`}
                onClick={() => onChange({ selectedAwardId: quote.id })}
              >
                <header>
                  <strong>{quote.metal || 'Award'} · {quote.program}</strong>
                  {quote.sample ? <span className="tag">SAMPLE</span> : null}
                </header>
                <div>{formatMilesSafe(quote.miles)} miles + {formatUsd(quote.taxesUsd)} tax pp · {quote.seats} seats</div>
                <div className="hint">{quote.origin} → {quote.destination} · {quote.depart || 'dates TBD'}</div>
                {quote.notes ? <div className="hint">{quote.notes}</div> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" disabled={!canContinue} onClick={onNext}>
          {trip.isDomestic ? 'Score this cash fare' : 'Score this deal'}
        </button>
      </div>
    </article>
  )
}

function formatMilesSafe(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

function CashForm({
  value,
  onChange,
  onAdd,
}: {
  value: Omit<CashQuote, 'id'>
  onChange: (next: Omit<CashQuote, 'id'>) => void
  onAdd: () => void
}) {
  return (
    <div className="card" style={{ marginTop: 10 }}>
      <div className="field-row">
        <label className="field">Airline / routing<input value={value.airline} onChange={(e) => onChange({ ...value, airline: e.target.value })} /></label>
        <label className="field">Cash USD / person<input type="number" min={0} value={value.cashUsd || ''} onChange={(e) => onChange({ ...value, cashUsd: Number(e.target.value) || 0 })} /></label>
      </div>
      <div className="field-row">
        <label className="field">From<input value={value.origin} onChange={(e) => onChange({ ...value, origin: e.target.value.toUpperCase() })} /></label>
        <label className="field">To<input value={value.destination} onChange={(e) => onChange({ ...value, destination: e.target.value.toUpperCase() })} /></label>
      </div>
      <div className="field-row">
        <label className="field">Depart<input type="date" value={value.depart} onChange={(e) => onChange({ ...value, depart: e.target.value })} /></label>
        <label className="field">Return<input type="date" value={value.returnDate} onChange={(e) => onChange({ ...value, returnDate: e.target.value })} /></label>
      </div>
      <div className="field-row">
        <label className="field">
          Cabin
          <select value={value.cabin} onChange={(e) => onChange({ ...value, cabin: e.target.value as Cabin })}>
            <option value="business_or_first">Business / first</option>
            <option value="premium_economy">Premium economy</option>
            <option value="coach">Coach</option>
          </select>
        </label>
        <label className="field">Nonstop hours (one-way)<input type="number" min={0} step={0.5} value={value.hoursOneWay || ''} onChange={(e) => onChange({ ...value, hoursOneWay: Number(e.target.value) || 0 })} /></label>
      </div>
      <label className="field">
        Notes
        <input value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} />
      </label>
      <label className="checklist" style={{ marginTop: 8 }}>
        <span>
          <input type="checkbox" checked={value.sample} onChange={(e) => onChange({ ...value, sample: e.target.checked })} />
          {' '}Mark as SAMPLE placeholder
        </span>
      </label>
      <button className="btn" type="button" style={{ marginTop: 10 }} onClick={onAdd} disabled={!value.cashUsd}>
        Save cash paste
      </button>
    </div>
  )
}

function AwardForm({
  value,
  onChange,
  onAdd,
}: {
  value: Omit<AwardQuote, 'id'>
  onChange: (next: Omit<AwardQuote, 'id'>) => void
  onAdd: () => void
}) {
  return (
    <div className="card" style={{ marginTop: 10 }}>
      <div className="field-row">
        <label className="field">Award program (e.g. Aeroplan)<input value={value.program} onChange={(e) => onChange({ ...value, program: e.target.value })} placeholder="Aeroplan" /></label>
        <label className="field">Metal / airline<input value={value.metal} onChange={(e) => onChange({ ...value, metal: e.target.value })} placeholder="EgyptAir" /></label>
      </div>
      <div className="field-row">
        <label className="field">Miles / person<input type="number" min={0} value={value.miles || ''} onChange={(e) => onChange({ ...value, miles: Number(e.target.value) || 0 })} /></label>
        <label className="field">Taxes USD / person<input type="number" min={0} step={0.01} value={value.taxesUsd || ''} onChange={(e) => onChange({ ...value, taxesUsd: Number(e.target.value) || 0 })} /></label>
      </div>
      <div className="field-row">
        <label className="field">From<input value={value.origin} onChange={(e) => onChange({ ...value, origin: e.target.value.toUpperCase() })} /></label>
        <label className="field">To<input value={value.destination} onChange={(e) => onChange({ ...value, destination: e.target.value.toUpperCase() })} /></label>
      </div>
      <div className="field-row">
        <label className="field">Seats seen<input type="number" min={1} value={value.seats} onChange={(e) => onChange({ ...value, seats: Number(e.target.value) || 1 })} /></label>
        <label className="field">
          Cabin
          <select value={value.cabin} onChange={(e) => onChange({ ...value, cabin: e.target.value as Cabin })}>
            <option value="business_or_first">Business / first</option>
            <option value="premium_economy">Premium economy</option>
            <option value="coach">Coach</option>
          </select>
        </label>
      </div>
      <label className="field">Notes<input value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="SAMPLE EgyptAir/Aeroplan-style placeholder" /></label>
      <label className="checklist" style={{ marginTop: 8 }}>
        <span>
          <input type="checkbox" checked={value.sample} onChange={(e) => onChange({ ...value, sample: e.target.checked })} />
          {' '}Mark as SAMPLE editable award input
        </span>
      </label>
      <button className="btn" type="button" style={{ marginTop: 10 }} onClick={onAdd} disabled={!value.miles || !value.program}>
        Save award paste
      </button>
    </div>
  )
}
