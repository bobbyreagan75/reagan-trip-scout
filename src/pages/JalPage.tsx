import { POLICY } from '../data/household'
import { useApp } from '../context/AppContext'
import { formatCpp } from '../lib/cpp'
import { formatMiles, formatUsd } from '../lib/format'
import { jalCoverage, jalIdeaCpp, jalPoorValue } from '../lib/jal'
import type { Cabin, JalIdea } from '../types'

export function JalPage() {
  const { balances, jalIdeas, setJalIdeas, trip, setView } = useApp()
  const jal = balances.find((row) => row.key === 'JAL_JMB_Rhonda')
  const balance = jal?.amount ?? 240000
  const party = trip.constraints.partySize

  function patch(id: string, next: Partial<JalIdea>) {
    setJalIdeas((rows) => rows.map((row) => (row.id === id ? { ...row, ...next } : row)))
  }

  return (
    <>
      <section className="hero">
        <div className="kicker">Rhonda’s JAL Mileage Bank</div>
        <h1>{formatMiles(balance)} miles, parked for premium cabins</h1>
        <p className="lede">
          Native JAL miles — not a transfer dump. Mock-book on the JAL site before anything moves.
          Do not speculative-transfer miles <em>into</em> JAL, and do not burn this pile on coach or junk CPP.
          Estimates below are SAMPLE and editable.
        </p>
        <p className="banner warn">{POLICY.mockBook}</p>
      </section>

      <section className="table-like">
        {jalIdeas.map((idea) => {
          const cover = jalCoverage(balance, idea.milesPerPerson, party)
          const { cpp, verdict } = jalIdeaCpp(idea)
          const poor = jalPoorValue(idea)
          return (
            <article key={idea.id} className="card">
              <div className="row-between">
                <h2>{idea.title}</h2>
                {idea.sample ? <span className="tag">SAMPLE</span> : null}
              </div>
              <p className="hint">{idea.region} · party of {party}</p>
              <div className="field-row">
                <label className="field">
                  Miles / person
                  <input type="number" min={0} value={idea.milesPerPerson || ''} onChange={(e) => patch(idea.id, { milesPerPerson: Number(e.target.value) || 0, sample: false })} />
                </label>
                <label className="field">
                  Cash comp USD / person
                  <input type="number" min={0} value={idea.cashCompUsd || ''} onChange={(e) => patch(idea.id, { cashCompUsd: Number(e.target.value) || 0 })} />
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  Taxes USD / person
                  <input type="number" min={0} value={idea.taxesUsd || ''} onChange={(e) => patch(idea.id, { taxesUsd: Number(e.target.value) || 0 })} />
                </label>
                <label className="field">
                  Cabin
                  <select value={idea.cabin} onChange={(e) => patch(idea.id, { cabin: e.target.value as Cabin })}>
                    <option value="business_or_first">Business / first</option>
                    <option value="premium_economy">Premium economy</option>
                    <option value="coach">Coach</option>
                  </select>
                </label>
              </div>
              <p className={`banner ${poor || verdict === 'below' ? 'warn' : verdict === 'luxury' ? 'ok' : 'cash'}`}>
                CPP {formatCpp(cpp)} · need {formatMiles(cover.need)} for {party} ·
                {cover.enough ? ` remaining ${formatMiles(cover.remaining)}` : ' short of the pile'}
                {poor ? ' — FAIL the 2¢ floor. Do not burn JAL here.' : ''}
              </p>
              <p className="hint">{idea.notes}</p>
              <p className="hint">Cash reference {formatUsd(idea.cashCompUsd)} pp. Edit after a real mock-book — these are not live prices.</p>
            </article>
          )
        })}
      </section>
      <p className="hint" style={{ marginTop: 16 }}>
        Asia / transpacific on JAL metal is the point of this stash. Intra-Japan coach and random oneworld dumps are how 240k disappears. {POLICY.minCpp}
      </p>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={() => setView('plan')}>Use in a trip plan</button>
      </div>
    </>
  )
}
