import { useState } from 'react'
import { DEMO_PASSPHRASE, POLICY } from '../data/household'
import { useApp } from '../context/AppContext'

export function SettingsPage() {
  const { settings, updateSettings, changePassphrase, resetData } = useApp()
  const [pass, setPass] = useState('')
  const [note, setNote] = useState('')

  return (
    <>
      <section className="hero">
        <div className="kicker">Household lock</div>
        <h1>Settings</h1>
        <p className="lede">
          Simple shared passphrase, hashed in this browser. No cloud login. Optional seats.aero
          API key is stored locally and never sent anywhere else from this prototype except seats.aero.
        </p>
      </section>

      <section className="card">
        <h2>Passphrase</h2>
        <p className="hint">First-run default is <code>{DEMO_PASSPHRASE}</code>. Change it if anyone else can reach this browser.</p>
        <label className="field">
          New household passphrase
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        <div className="progress-actions">
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (pass.trim().length < 6) {
                setNote('Use at least 6 characters.')
                return
              }
              void changePassphrase(pass).then(() => setNote('Passphrase updated. It stays on this device.'))
            }}
          >
            Save passphrase
          </button>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>seats.aero API hook</h2>
        <p className="hint">
          v1 is deep links + paste-back. If you later add a partner API key, it is saved only in localStorage.
          Browser CORS often blocks live calls — the paste path still wins.
        </p>
        <label className="field">
          Partner API key (optional)
          <input
            type="password"
            value={settings.seatsApiKey}
            onChange={(e) => updateSettings({ seatsApiKey: e.target.value })}
            placeholder="Not required for the prototype"
          />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          AwardWallet URL
          <input
            value={settings.awardWalletUrl}
            onChange={(e) => updateSettings({ awardWalletUrl: e.target.value })}
          />
        </label>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Reset</h2>
        <p className="hint">Restores seeded balances and clears the current trip draft. Does not change the passphrase.</p>
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            resetData()
            setNote('Trip draft cleared and balances restored from the household snapshot.')
          }}
        >
          Restore household snapshot
        </button>
        {note ? <p className="banner ok">{note}</p> : null}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>What this app will not do</h2>
        <ul className="policy-list">
          <li>It does not scrape Google Flights, seats.aero, or AwardWallet.</li>
          <li>It does not store credit-card or AwardWallet passwords.</li>
          <li>It does not reproduce anyone’s travel ebook, charts, or coaching brand. {POLICY.minCpp}</li>
        </ul>
      </section>
    </>
  )
}
