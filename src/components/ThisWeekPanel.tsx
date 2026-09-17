import { useState } from 'react'
import { EARN_CARDS, emptyBonus } from '../data/alerts'
import { COS_EMAIL, POLICY } from '../data/household'
import { useApp } from '../context/AppContext'
import { bonusActive, bonusExpired, bonusSummary } from '../lib/alerts'
import { copyText, newId } from '../lib/format'
import { watchAlertText, watchMailto, watchSummary } from '../lib/watchlist'
import type { AwardWatch, EarnCardId, TransferBonus } from '../types'

export function ThisWeekPanel() {
  const { bonuses, setBonuses, earnNotes, setEarnNotes, watches, setView } = useApp()
  const [form, setForm] = useState<TransferBonus>(emptyBonus())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function saveBonus() {
    if (!form.fromProgram.trim() || !form.partner.trim()) return
    if (editingId) {
      setBonuses((rows) => rows.map((row) => (row.id === editingId ? { ...form, id: editingId, sample: false } : row)))
    } else {
      setBonuses((rows) => [...rows, { ...form, id: newId('bonus'), sample: false }])
    }
    setForm(emptyBonus())
    setEditingId(null)
    setToast('Bonus saved in this browser.')
  }

  async function copyWatch(watch: AwardWatch) {
    const ok = await copyText(watchAlertText(watch))
    setToast(ok ? 'Watch alert copied. Mail is optional — this desk does not auto-email.' : 'Copy blocked — use the email link if you want.')
  }

  function patchEarn(id: EarnCardId, patch: { note?: string; flexCategories?: string }) {
    setEarnNotes((current) => ({
      ...current,
      [id]: { note: current[id]?.note ?? '', flexCategories: current[id]?.flexCategories ?? '', ...patch },
    }))
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="this-week" id="this-week">
      <div className="kicker">This week</div>
      <h2>Alerts for the Reagan desk</h2>
      <p className="lede">
        Transfer windows, natural-spend reminders, and open watches. This panel does not auto-email.
        Program devaluations and tool/product news stay with Chief of Staff — not here.
      </p>

      <h3>Transfer bonuses</h3>
      <p className="hint">
        Extra miles on a 1:1 base only. Edit the SAMPLE rows when a real window is live. Cash vs points will ask “applies to this trip?”
      </p>
      <div className="card bonus-editor">
        <h3>{editingId ? 'Edit bonus' : 'Add a bonus'}</h3>
        <div className="field-row">
          <label className="field">From program<input value={form.fromProgram} onChange={(e) => setForm({ ...form, fromProgram: e.target.value })} placeholder="Amex Membership Rewards" /></label>
          <label className="field">Partner<input value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} placeholder="Aeroplan" /></label>
        </div>
        <div className="field-row">
          <label className="field">Bonus %<input type="number" min={0} value={form.bonusPercent || ''} onChange={(e) => setForm({ ...form, bonusPercent: Number(e.target.value) || 0 })} /></label>
          <label className="field">End date<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
        </div>
        <label className="field">Notes<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Paste the live terms. Mock-book before transfer." /></label>
        <div className="progress-actions">
          <button className="btn-ghost" type="button" onClick={() => { setForm(emptyBonus()); setEditingId(null) }}>Clear</button>
          <button className="btn" type="button" onClick={saveBonus} disabled={!form.fromProgram.trim() || !form.partner.trim()}>
            {editingId ? 'Update bonus' : 'Save bonus'}
          </button>
        </div>
      </div>
      <div className="table-like" style={{ marginTop: 12 }}>
        {bonuses.length === 0 ? <p className="hint">No bonuses saved. Add one if a 1:1-plus window is actually live.</p> : null}
        {bonuses.map((bonus) => {
          const expired = bonusExpired(bonus, today)
          const active = bonusActive(bonus, today)
          return (
            <article key={bonus.id} className="quote">
              <header>
                <strong>{bonusSummary(bonus)}</strong>
                {bonus.sample ? <span className="tag">SAMPLE</span> : null}
                {expired ? <span className="verdict FAIL">Ended</span> : active ? <span className="verdict PASS">Active</span> : <span className="verdict MARGINAL">Draft</span>}
              </header>
              {bonus.notes ? <div className="hint">{bonus.notes}</div> : null}
              <div className="links">
                <button type="button" onClick={() => { setForm(bonus); setEditingId(bonus.id) }}>Edit</button>
                <button type="button" onClick={() => setBonuses((rows) => rows.filter((row) => row.id !== bonus.id))}>Delete</button>
              </div>
            </article>
          )
        })}
      </div>

      <h3 style={{ marginTop: 22 }}>Earn this week</h3>
      <p className="hint">{POLICY.earning} Rotating 5% is a placeholder until you paste this quarter’s categories.</p>
      <div className="earn-grid">
        {EARN_CARDS.map((card) => {
          const notes = earnNotes[card.id]
          return (
            <article key={card.id} className="earn-card">
              <h3>{card.card}</h3>
              <p className="hint">{card.tip}</p>
              {card.flexPlaceholder ? (
                <label className="field">
                  This quarter’s 5% categories
                  <input
                    value={notes?.flexCategories ?? ''}
                    onChange={(e) => patchEarn(card.id, { flexCategories: e.target.value })}
                    placeholder="Paste live categories — grocery, gas, etc."
                  />
                </label>
              ) : null}
              <label className="field">
                Household note
                <input
                  value={notes?.note ?? ''}
                  onChange={(e) => patchEarn(card.id, { note: e.target.value })}
                  placeholder="Optional — what you actually plan to put on this card"
                />
              </label>
            </article>
          )
        })}
      </div>

      <h3 style={{ marginTop: 22 }}>Watchlist hits</h3>
      <p className="hint">
        No live scrape and no auto-email. These are the routes you asked to be pinged about — copy or open mail to {COS_EMAIL} when they print.
      </p>
      <div className="table-like">
        {watches.length === 0 ? <p className="hint">No watches yet. Add one under Watch.</p> : null}
        {watches.map((watch) => (
          <article key={watch.id} className="quote">
            <header>
              <strong>{watchSummary(watch)}</strong>
              <span className="muted">{watch.windowStart || 'open'} → {watch.windowEnd || 'open'}</span>
            </header>
            <div className="hint">{watch.program}{watch.notes ? ` · ${watch.notes}` : ''}</div>
            <div className="links">
              <button type="button" onClick={() => void copyWatch(watch)}>Copy alert</button>
              <a href={watchMailto(watch)}>Email {COS_EMAIL}</a>
            </div>
          </article>
        ))}
      </div>
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={() => setView('watch')}>Open full watchlist</button>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
    </section>
  )
}
