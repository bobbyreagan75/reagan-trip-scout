import { POLICY } from '../../data/household'
import { laneById, scoreDeal } from '../../lib/dealScore'
import type { BalanceRow, DealVerdict, RedemptionChannel, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  balances: BalanceRow[]
  onChange: (patch: Partial<TripDraft>) => void
  onBack: () => void
  onNext: () => void
}

const CHANNELS: { id: RedemptionChannel; label: string; never: boolean }[] = [
  { id: 'airline_or_program', label: 'Airline ticket or program award', never: false },
  { id: 'portal', label: 'Card travel portal', never: true },
  { id: 'gift_card', label: 'Gift card', never: true },
  { id: 'statement_credit', label: 'Statement credit', never: true },
  { id: 'cruise_flexible_points', label: 'Cruise with flexible points', never: true },
]

export function VerifyStep({ trip, balances, onChange, onBack, onNext }: Props) {
  const score = scoreDeal(trip, balances)
  const cash = laneById(score, 'cash')
  const points = laneById(score, 'points')

  return (
    <article className="bubble scout">
      <div className="kicker">Deal Score</div>
      <h2>Does this deal clear the household gate?</h2>
      <p className="lede">{POLICY.dealGate} {POLICY.never}</p>
      {trip.demoLabel ? <div className="banner sample">{trip.demoLabel}. SAMPLE figures are scored the same way as live pastes.</div> : null}

      <div className={`score-hero ${score.overall.toLowerCase()}`}>
        <div className={`verdict ${score.overall}`}>{score.overall}</div>
        <p className="stamp">{score.overall}</p>
        <p className="hint">{score.summary}</p>
      </div>

      <div className="grid-2">
        {cash ? <LaneCard title="Cash lane" lane={cash} /> : null}
        {points ? <LaneCard title="Points lane" lane={points} /> : null}
      </div>

      <h3 style={{ marginTop: 16 }}>What kind of redemption is this?</h3>
      <div className="chip-row">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            type="button"
            className={`choice ${trip.redemptionChannel === channel.id ? 'selected' : ''}`}
            onClick={() => onChange({ redemptionChannel: channel.id })}
          >
            <strong>{channel.label}</strong>
            <div className="hint">{channel.never ? 'Never passes.' : 'Can be scored.'}</div>
          </button>
        ))}
      </div>

      <p className="hint" style={{ marginTop: 14 }}>
        {score.recommended
          ? `Recommended next: ${score.recommended === 'points' ? 'points' : 'cash'}. Cash vs points stays closed until a lane is PASS or MARGINAL.`
          : 'Keep hunting. A FAIL on every lane means no booking and no transfer.'}
      </p>

      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back to search</button>
        <button
          className="btn"
          type="button"
          disabled={!score.canProceedToPay}
          onClick={() => {
            onChange({ payWith: score.recommended })
            onNext()
          }}
        >
          {score.canProceedToPay ? 'Continue to cash vs points' : 'Gate closed — keep hunting'}
        </button>
      </div>
    </article>
  )
}

function LaneCard({ title, lane }: { title: string; lane: { verdict: DealVerdict; allowed: boolean; headline: string; checks: { id: string; label: string; verdict: DealVerdict; detail: string; numbers: Record<string, string> }[] } }) {
  return (
    <div className={`quote ${lane.allowed ? 'selected' : ''}`}>
      <header>
        <strong>{title}</strong>
        <span className={`verdict ${lane.verdict}`}>{lane.verdict}</span>
      </header>
      <p className="hint">{lane.headline}</p>
      {lane.checks.map((check) => (
        <div key={check.id} className="check-row">
          <span className={`verdict ${check.verdict}`}>{check.verdict}</span>
          <div>
            <strong>{check.label}</strong>
            <div className="hint">{check.detail}</div>
            <div className="nums">
              {Object.entries(check.numbers).map(([key, value]) => (
                <span key={key}>{key}: {value}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
