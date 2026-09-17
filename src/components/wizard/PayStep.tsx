import { useState } from 'react'
import { POLICY } from '../../data/household'
import { ceilingForQuote, quoteExceedsCeiling } from '../../lib/ceilings'
import { cppForQuotes, cppVerdict, formatCpp } from '../../lib/cpp'
import { formatMiles, formatUsd } from '../../lib/format'
import { recommendedTransfer, transferOptions } from '../../lib/transfers'
import type { BalanceRow, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  balances: BalanceRow[]
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

const MOCK_BOOK = [
  'Search the award on the program site and start a mock booking with both names.',
  'Confirm metal, cabin, dates, seat count, and taxes before anything moves.',
  'Screenshot or hold the PNR. If it cannot be held, keep the browser session open.',
  'Only then transfer 1:1 from the chosen flexible currency.',
  'Book immediately after the transfer posts. Never transfer “just in case.”',
  'Skip any transfer that is not 1:1. Bonus-only or worse ratios are a no.',
]

export function PayStep({ trip, balances, onChange, onBack, onNext }: Props) {
  const cash = trip.cashQuotes.find((q) => q.id === trip.selectedCashId) ?? trip.cashQuotes[0]
  const award = trip.awardQuotes.find((q) => q.id === trip.selectedAwardId) ?? trip.awardQuotes[0]
  const cpp = cash && award ? cppForQuotes(cash, award, trip.constraints.partySize) : null
  const verdict = cppVerdict(cpp)
  const options = award ? transferOptions({ award, balances, partySize: trip.constraints.partySize }) : []
  const rec = recommendedTransfer(options)
  const [checks, setChecks] = useState<boolean[]>(() => MOCK_BOOK.map(() => false))

  if (trip.isDomestic) {
    return (
      <article className="bubble scout">
        <div className="kicker">Scout</div>
        <h2>Use cash. Points stay home.</h2>
        <p className="banner cash">{POLICY.domesticCash}</p>
        {cash ? (
          <div className="quote selected">
            <header><strong>{cash.airline || 'Selected cash fare'}</strong>{cash.sample ? <span className="tag">SAMPLE</span> : null}</header>
            <div>{formatUsd(cash.cashUsd)} per person · {cash.origin} → {cash.destination}</div>
            <div className="hint">
              Ceiling {ceilingForQuote(cash) != null ? formatUsd(ceilingForQuote(cash)!) : 'needs hours'}
              {quoteExceedsCeiling(cash) ? ' — this fare is above the household hourly cap.' : ' — inside the hourly cap.'}
            </div>
          </div>
        ) : <p className="hint">Paste a Google Flights total on the previous step.</p>}
        <div className="progress-actions">
          <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
          <button className="btn" type="button" onClick={() => { onChange({ payWith: 'cash' }); onNext() }}>Continue to lodging</button>
        </div>
      </article>
    )
  }

  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>Use cash or points?</h2>
      <p className="lede">{POLICY.minCpp} {POLICY.amexBeforeBilt}</p>

      <div className="grid-2">
        {cash ? (
          <div className="quote">
            <div className="muted">Cash</div>
            <strong>{formatUsd(cash.cashUsd)} pp</strong>
            <div className="hint">{cash.airline} · party {formatUsd(cash.cashUsd * trip.constraints.partySize)}</div>
            {quoteExceedsCeiling(cash) ? <div className="banner warn">Over the cash ceiling of {formatUsd(ceilingForQuote(cash)!)}.</div> : null}
          </div>
        ) : <div className="quote">No cash quote yet.</div>}
        {award ? (
          <div className="quote">
            <div className="muted">Points {award.sample ? '· SAMPLE' : ''}</div>
            <strong>{formatMiles(award.miles)} + {formatUsd(award.taxesUsd)} pp</strong>
            <div className="hint">{award.metal} on {award.program} · {award.seats} seats</div>
          </div>
        ) : <div className="quote">No award quote yet.</div>}
      </div>

      <p className={`banner ${verdict === 'below' ? 'warn' : 'ok'}`} style={{ marginTop: 12 }}>
        CPP vs cash: {formatCpp(cpp)} {verdict === 'below' ? '— under 2¢, keep the points.' : verdict === 'luxury' ? '— luxury-range redemption.' : verdict === 'ok' ? '— clears the 2¢ floor.' : '— paste both a cash and award figure to score it.'}
      </p>

      <div className="choice-grid">
        <button type="button" className={`choice ${trip.payWith === 'cash' ? 'selected' : ''}`} onClick={() => onChange({ payWith: 'cash' })}>
          <strong>Pay cash</strong>
          <div className="hint">Good when the fare sits under the hourly ceiling and points would land under 2¢.</div>
        </button>
        <button type="button" className={`choice ${trip.payWith === 'points' ? 'selected' : ''}`} onClick={() => onChange({ payWith: 'points', chosenTransferKey: rec?.currencyKey ?? null })}>
          <strong>Use points</strong>
          <div className="hint">International luxury lane. Transfer 1:1 only, and only after a mock book.</div>
        </button>
      </div>

      {trip.payWith === 'points' ? (
        <>
          <h3 style={{ marginTop: 16 }}>1:1 transfer partners</h3>
          {options.length === 0 ? <p className="hint">No 1:1 path found for {award?.program}. Check the program name or keep hunting.</p> : null}
          <div className="table-like">
            {options.map((option) => (
              <button
                key={option.currencyKey}
                type="button"
                className={`quote ${trip.chosenTransferKey === option.currencyKey ? 'selected' : ''}`}
                onClick={() => onChange({ chosenTransferKey: option.currencyKey })}
              >
                <header>
                  <strong>{option.currencyName} → {option.program}</strong>
                  <span className="muted">{option.ratio}</span>
                </header>
                <div>{formatMiles(option.milesNeeded)} needed · {formatMiles(option.balance)} on hand</div>
                <div className="hint">
                  {option.enough ? 'Enough for both travelers.' : 'Short — pick another currency or wait.'}
                  {option.preferOverBilt ? ' · Spend Amex before Bilt.' : ''}
                  {option.keepForHyatt ? ' · Keep Bilt for Hyatt.' : ''}
                  {option.stashWarning ? ' · Would dip under the ~50k/person rainy-day stash.' : ''}
                </div>
              </button>
            ))}
          </div>
          <h3 style={{ marginTop: 16 }}>Mock-book before any transfer</h3>
          <p className="hint">{POLICY.mockBook}</p>
          <div className="checklist">
            {MOCK_BOOK.map((item, idx) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checks[idx]}
                  onChange={(e) => setChecks((current) => current.map((v, i) => (i === idx ? e.target.checked : v)))}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </>
      ) : null}

      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
        <button className="btn" type="button" disabled={!trip.payWith} onClick={onNext}>Continue to lodging</button>
      </div>
    </article>
  )
}
