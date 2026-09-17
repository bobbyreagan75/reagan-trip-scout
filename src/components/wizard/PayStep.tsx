import { MOCK_BOOK_ITEMS, POLICY } from '../../data/household'
import { useApp } from '../../context/AppContext'
import { ceilingForQuote, quoteExceedsCeiling } from '../../lib/ceilings'
import { laneById, mockBookComplete, scoreDeal } from '../../lib/dealScore'
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

export function PayStep({ trip, balances, onChange, onBack, onNext }: Props) {
  const { setView } = useApp()
  const score = scoreDeal(trip, balances)
  const cashLane = laneById(score, 'cash')
  const pointsLane = laneById(score, 'points')
  const jal = balances.find((row) => row.key === 'JAL_JMB_Rhonda')
  const cash = trip.cashQuotes.find((q) => q.id === trip.selectedCashId) ?? trip.cashQuotes[0]
  const award = trip.awardQuotes.find((q) => q.id === trip.selectedAwardId) ?? trip.awardQuotes[0]
  const options = award ? transferOptions({ award, balances, partySize: trip.constraints.partySize }) : []
  const rec = recommendedTransfer(options)
  const checks = padChecks(trip.mockBookChecks)
  const booked = mockBookComplete(checks)
  const cashAllowed = Boolean(cashLane?.allowed)
  const pointsAllowed = Boolean(pointsLane?.allowed)

  function setChecks(next: boolean[]) {
    onChange({ mockBookChecks: next })
  }

  const canContinue = trip.payWith === 'cash'
    ? cashAllowed
    : trip.payWith === 'points'
      ? pointsAllowed && booked
      : false

  if (trip.isDomestic) {
    return (
      <article className="bubble scout">
        <div className="kicker">Scout</div>
        <h2>Use cash. Points stay home.</h2>
        <p className="banner cash">{POLICY.domesticCash}</p>
        <p className="banner">{score.summary}</p>
        {cash ? (
          <div className="quote selected">
            <header>
              <strong>{cash.airline || 'Selected cash fare'}</strong>
              <span className={`verdict ${cashLane?.verdict ?? 'FAIL'}`}>{cashLane?.verdict ?? 'FAIL'}</span>
            </header>
            <div>{formatUsd(cash.cashUsd)} per person · {cash.origin} → {cash.destination}</div>
            <div className="hint">
              Ceiling {ceilingForQuote(cash) != null ? formatUsd(ceilingForQuote(cash)!) : 'needs hours'}
              {quoteExceedsCeiling(cash) ? ' — this fare is above the household hourly cap.' : ' — inside the hourly cap.'}
            </div>
          </div>
        ) : <p className="hint">Paste a Google Flights total on the search step.</p>}
        {pointsLane ? <p className="banner warn">{pointsLane.headline}</p> : null}
        <div className="progress-actions">
          <button className="btn-ghost" type="button" onClick={onBack}>Back to Deal Score</button>
          <button
            className="btn"
            type="button"
            disabled={!cashAllowed}
            onClick={() => { onChange({ payWith: 'cash' }); onNext() }}
          >
            {cashAllowed ? 'Continue to lodging' : 'Cash lane failed the gate'}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="bubble scout">
      <div className="kicker">Scout</div>
      <h2>Use cash or points?</h2>
      <p className="lede">Only lanes that cleared Deal Score are open. {POLICY.amexBeforeBilt}</p>
      <p className={`banner ${score.overall === 'FAIL' ? 'warn' : 'ok'}`}>{score.summary}</p>

      <div className="grid-2">
        {cash ? (
          <div className={`quote ${trip.payWith === 'cash' ? 'selected' : ''}`}>
            <div className="muted">Cash <span className={`verdict ${cashLane?.verdict ?? 'FAIL'}`}>{cashLane?.verdict ?? 'FAIL'}</span></div>
            <strong>{formatUsd(cash.cashUsd)} pp</strong>
            <div className="hint">{cash.airline} · party {formatUsd(cash.cashUsd * trip.constraints.partySize)}</div>
            {cashLane ? <div className="hint">{cashLane.headline}</div> : null}
          </div>
        ) : <div className="quote">No cash quote yet.</div>}
        {award ? (
          <div className={`quote ${trip.payWith === 'points' ? 'selected' : ''}`}>
            <div className="muted">Points {award.sample ? '· SAMPLE' : ''} <span className={`verdict ${pointsLane?.verdict ?? 'FAIL'}`}>{pointsLane?.verdict ?? 'FAIL'}</span></div>
            <strong>{formatMiles(award.miles)} + {formatUsd(award.taxesUsd)} pp</strong>
            <div className="hint">{award.metal} on {award.program} · {award.seats} seats</div>
            {pointsLane ? <div className="hint">{pointsLane.headline}</div> : null}
          </div>
        ) : <div className="quote">No award quote yet.</div>}
      </div>

      <div className="choice-grid">
        <button
          type="button"
          className={`choice ${trip.payWith === 'cash' ? 'selected' : ''}`}
          disabled={!cashAllowed}
          onClick={() => onChange({ payWith: 'cash' })}
        >
          <strong>Pay cash</strong>
          <div className="hint">{cashAllowed ? 'Open — this fare cleared the hourly gate.' : 'Closed — cash failed Deal Score.'}</div>
        </button>
        <button
          type="button"
          className={`choice ${trip.payWith === 'points' ? 'selected' : ''}`}
          disabled={!pointsAllowed}
          onClick={() => onChange({ payWith: 'points', chosenTransferKey: rec?.currencyKey ?? null })}
        >
          <strong>Use points</strong>
          <div className="hint">{pointsAllowed ? 'Open — mock-book still required before any transfer.' : 'Closed — points failed Deal Score.'}</div>
        </button>
      </div>

      {trip.payWith === 'points' && pointsAllowed ? (
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
          <p className="hint">{POLICY.mockBook} Transfer stays locked until every box is ticked.</p>
          <div className="checklist">
            {MOCK_BOOK_ITEMS.map((item, idx) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={Boolean(checks[idx])}
                  onChange={(e) => setChecks(checks.map((v, i) => (i === idx ? e.target.checked : v)))}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <p className={`banner ${booked ? 'ok' : 'warn'}`}>
            {booked
              ? 'Mock-book PASS — you may continue to lodging. Transfer only after the hold is real.'
              : 'Mock-book is not complete — no transfer and no booking yet.'}
          </p>
        </>
      ) : null}

      {jal ? (
        <p className="banner cash">
          Rhonda’s JAL Mileage Bank is {formatMiles(jal.amount)} native miles — not a 1:1 transfer dump.
          Do not speculative-transfer into JAL, and do not burn it on junk CPP.{' '}
          <button type="button" className="btn-ghost" onClick={() => setView('jal')}>Open JAL ideas</button>
        </p>
      ) : null}

      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back to Deal Score</button>
        <button className="btn" type="button" disabled={!canContinue} onClick={onNext}>
          {trip.payWith === 'points' && !booked ? 'Tick the mock-book list' : 'Continue to lodging'}
        </button>
      </div>
    </article>
  )
}

function padChecks(current: boolean[]): boolean[] {
  return MOCK_BOOK_ITEMS.map((_, idx) => Boolean(current[idx]))
}
