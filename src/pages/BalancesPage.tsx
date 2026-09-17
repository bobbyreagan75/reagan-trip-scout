import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { matchCsvProgramToKey, parseAwardWalletCsv } from '../lib/csv'
import { formatMiles } from '../lib/format'
import { seedBalanceRows } from '../data/household'
import type { BalanceRow } from '../types'

export function BalancesPage() {
  const { balances, setBalances, settings } = useApp()
  const [csvText, setCsvText] = useState('')
  const [message, setMessage] = useState('')

  function updateAmount(key: BalanceRow['key'], amount: number) {
    setBalances((rows) =>
      rows.map((row) =>
        row.key === key
          ? { ...row, amount, source: 'manual', updatedAt: new Date().toISOString() }
          : row,
      ),
    )
  }

  function importCsv() {
    const parsed = parseAwardWalletCsv(csvText)
    if (!parsed.rows.length) {
      setMessage(parsed.warnings[0] || 'No rows found.')
      return
    }
    setBalances((rows) => {
      const next = rows.map((row) => ({ ...row }))
      for (const incoming of parsed.rows) {
        const match = matchCsvProgramToKey(incoming.program, next)
        if (match) {
          const idx = next.findIndex((row) => row.key === match.key)
          next[idx] = {
            ...next[idx],
            amount: incoming.amount,
            source: 'csv',
            updatedAt: new Date().toISOString(),
          }
        }
      }
      return next
    })
    setMessage(`Imported ${parsed.rows.length} row${parsed.rows.length === 1 ? '' : 's'}. Passwords are never stored. ${parsed.warnings.join(' ')}`)
  }

  return (
    <>
      <section className="hero">
        <div className="kicker">AwardWallet</div>
        <h1>Balances</h1>
        <p className="lede">
          Paste an AwardWallet CSV/export or edit a figure by hand. This desk never asks for
          AwardWallet passwords. Session scrape is out of scope for v1.
        </p>
        <div className="links">
          <a href={settings.awardWalletUrl} target="_blank" rel="noreferrer">Open AwardWallet</a>
          <a href="/sample-awardwallet.csv" target="_blank" rel="noreferrer">Download sample CSV</a>
        </div>
      </section>

      <section className="balance-grid">
        {balances.map((row) => (
          <label key={row.key} className="card field">
            {row.program}
            <input
              type="number"
              min={0}
              value={row.amount}
              onChange={(e) => updateAmount(row.key, Number(e.target.value) || 0)}
            />
            <span className="hint">{row.traveler} · {formatMiles(row.amount)} · {row.source}</span>
          </label>
        ))}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Import CSV</h2>
        <p className="hint">Headers like Program / Balance / Traveler work. A sample export lives in the repo for the Cairo-era snapshot.</p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Program,Balance,Traveler"
        />
        <div className="progress-actions">
          <button className="btn" type="button" onClick={importCsv}>Apply import</button>
          <button className="btn-ghost" type="button" onClick={() => setBalances(seedBalanceRows())}>Restore Sep 2026 seed</button>
        </div>
        {message ? <p className="banner ok">{message}</p> : null}
      </section>
    </>
  )
}
