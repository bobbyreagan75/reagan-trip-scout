import { AIRPORTS, POLICY, seedBalanceRows } from '../data/household'
import { useApp } from '../context/AppContext'
import { formatMiles } from '../lib/format'

export function HomePage() {
  const { session, balances, newTrip, loadCairoDemo, setView } = useApp()
  const first = session?.traveler.split(' ')[0]
  const rows = balances.length ? balances : seedBalanceRows()
  const amex = rows.find((r) => r.key === 'Amex_MR_combined')
  const jal = rows.find((r) => r.key === 'JAL_JMB_Rhonda')

  return (
    <>
      <section className="hero">
        <div className="kicker">Welcome back</div>
        <h1>Good hunting, {first}.</h1>
        <p className="lede">{POLICY.dealFirst}</p>
        <div className="actions">
          <button className="btn" onClick={newTrip}>Start a trip</button>
          <button className="btn-gold" onClick={loadCairoDemo}>Load Cairo SAMPLE demo</button>
        </div>
      </section>

      <section className="grid-2" style={{ marginBottom: 16 }}>
        <button className="card" type="button" style={{ textAlign: 'left' }} onClick={() => setView('watch')}>
          <h3>Award watches</h3>
          <p className="hint">EgyptAir JFK–CAI business ≤75k for 2 in May 2027 is seeded. Copy/mailto when it prints.</p>
        </button>
        <button className="card" type="button" style={{ textAlign: 'left' }} onClick={() => setView('jal')}>
          <h3>JAL {jal ? formatMiles(jal.amount) : '240,000'}</h3>
          <p className="hint">Rhonda’s native pile. Transpacific premium SAMPLE ideas, editable CPP, mock-book first.</p>
        </button>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="row-between">
          <h2>Snapshot</h2>
          <button className="btn-ghost" onClick={() => setView('balances')}>Edit balances</button>
        </div>
        <p className="hint">Seeded from the 14 Sep 2026 household snapshot. Chase is the deduped figure. Paste an AwardWallet export anytime.</p>
        <div className="balance-grid" style={{ marginTop: 14 }}>
          {rows.slice(0, 6).map((row) => (
            <div key={row.key} className="balance-card">
              <div className="muted">{row.program}</div>
              <div className="amount">{formatMiles(row.amount)}</div>
            </div>
          ))}
        </div>
        {amex ? <p className="hint">Amex Membership Rewards is the spend-first flexible pile when Bilt can also reach the same airline.</p> : null}
      </section>

      <section className="grid-2">
        <article className="card">
          <h3>How this desk flies</h3>
          <ul className="policy-list">
            <li>{POLICY.dealGate}</li>
            <li>{POLICY.domesticCash}</li>
            <li>{POLICY.pointsLane}</li>
            <li>{POLICY.minCpp}</li>
            <li>{POLICY.mockBook}</li>
          </ul>
        </article>
        <article className="card">
          <h3>House defaults</h3>
          <ul className="policy-list">
            <li>Domestic home {AIRPORTS.domesticHome} · international position {AIRPORTS.internationalPosition}</li>
            <li>{POLICY.schedule}</li>
            <li>{POLICY.calendar}</li>
            <li>{POLICY.lodging}</li>
          </ul>
        </article>
      </section>
    </>
  )
}
