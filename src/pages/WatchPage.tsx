import { useState } from 'react'
import { COS_EMAIL, POLICY } from '../data/household'
import { useApp } from '../context/AppContext'
import { copyText, formatMiles, newId } from '../lib/format'
import {
  emptyWatchForm,
  watchAlertText,
  watchFlightsUrl,
  watchMailto,
  watchSeatsUrl,
  watchSummary,
} from '../lib/watchlist'
import type { AwardWatch, Cabin } from '../types'

export function WatchPage() {
  const { watches, setWatches } = useApp()
  const [form, setForm] = useState<AwardWatch>(emptyWatchForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function save() {
    if (!form.origin.trim() || !form.destination.trim() || !form.maxMiles) return
    if (editingId) {
      setWatches((rows) => rows.map((row) => (row.id === editingId ? { ...form, id: editingId } : row)))
    } else {
      setWatches((rows) => [...rows, { ...form, id: newId('watch') }])
    }
    setForm(emptyWatchForm())
    setEditingId(null)
    setToast('Watch saved in this browser.')
  }

  async function notify(watch: AwardWatch) {
    const ok = await copyText(watchAlertText(watch))
    setToast(ok ? 'Alert text copied. Open the mailto if you want Chief of Staff on email.' : 'Copy blocked — use the email link.')
  }

  return (
    <>
      <section className="hero">
        <div className="kicker">Award watchlist</div>
        <h1>Ping us when it prints</h1>
        <p className="lede">
          Save a route, cabin, mile cap, seats, and window. This desk does not scrape seats.aero.
          Notify copies an alert and opens mail to {COS_EMAIL}. Chief of Staff can email or continue in chat later.
        </p>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>{editingId ? 'Edit watch' : 'Add a watch'}</h2>
        <div className="field-row">
          <label className="field">Metal<input value={form.metal} onChange={(e) => setForm({ ...form, metal: e.target.value })} placeholder="EgyptAir" /></label>
          <label className="field">Program<input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="Aeroplan" /></label>
        </div>
        <div className="field-row">
          <label className="field">From<input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })} placeholder="JFK" /></label>
          <label className="field">To<input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })} placeholder="CAI" /></label>
        </div>
        <div className="field-row">
          <label className="field">
            Cabin
            <select value={form.cabin} onChange={(e) => setForm({ ...form, cabin: e.target.value as Cabin })}>
              <option value="business_or_first">Business / first</option>
              <option value="premium_economy">Premium economy</option>
              <option value="coach">Coach</option>
            </select>
          </label>
          <label className="field">Max miles<input type="number" min={1} value={form.maxMiles || ''} onChange={(e) => setForm({ ...form, maxMiles: Number(e.target.value) || 0 })} /></label>
        </div>
        <div className="field-row">
          <label className="field">Seats needed<input type="number" min={1} value={form.seatsNeeded} onChange={(e) => setForm({ ...form, seatsNeeded: Number(e.target.value) || 2 })} /></label>
          <label className="field">Window start<input type="date" value={form.windowStart} onChange={(e) => setForm({ ...form, windowStart: e.target.value })} /></label>
        </div>
        <div className="field-row">
          <label className="field">Window end<input type="date" value={form.windowEnd} onChange={(e) => setForm({ ...form, windowEnd: e.target.value })} /></label>
          <label className="field">Notes<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="progress-actions">
          <button className="btn-ghost" type="button" onClick={() => { setForm(emptyWatchForm()); setEditingId(null) }}>Clear</button>
          <button className="btn" type="button" onClick={save} disabled={!form.origin || !form.destination || !form.maxMiles}>
            {editingId ? 'Update watch' : 'Save watch'}
          </button>
        </div>
      </section>

      <section className="table-like">
        {watches.map((watch) => (
          <article key={watch.id} className="quote">
            <header>
              <strong>{watchSummary(watch)}</strong>
              <span className="muted">{watch.windowStart || 'open'} → {watch.windowEnd || 'open'}</span>
            </header>
            <div className="hint">{watch.program} · {formatMiles(watch.maxMiles)} max · {watch.seatsNeeded} seats</div>
            {watch.notes ? <div className="hint">{watch.notes}</div> : null}
            <div className="links">
              <a href={watchSeatsUrl(watch)} target="_blank" rel="noreferrer">seats.aero</a>
              <a href={watchFlightsUrl(watch)} target="_blank" rel="noreferrer">Google Flights</a>
              <button type="button" onClick={() => { setForm(watch); setEditingId(watch.id) }}>Edit</button>
              <button type="button" onClick={() => void notify(watch)}>Copy alert</button>
              <a href={watchMailto(watch)}>Email {COS_EMAIL}</a>
              <button type="button" onClick={() => setWatches((rows) => rows.filter((row) => row.id !== watch.id))}>Delete</button>
            </div>
          </article>
        ))}
      </section>
      <p className="hint" style={{ marginTop: 12 }}>{POLICY.mockBook} A watch is not a booking.</p>
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  )
}
