import { useState, type FormEvent } from 'react'
import { APP_NAME, DEMO_PASSPHRASE, HOUSEHOLD, POLICY } from '../data/household'
import { useApp } from '../context/AppContext'
import type { TravelerName } from '../types'

export function LoginPage() {
  const { login } = useApp()
  const [traveler, setTraveler] = useState<TravelerName>('Robert Reagan')
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const ok = await login(traveler, passphrase)
    setError(ok ? '' : 'That passphrase does not match the household lock.')
  }

  return (
    <div className="login-wrap">
      <form className="hero login-card" onSubmit={(e) => void onSubmit(e)}>
        <div className="kicker">Private household desk</div>
        <h1>{APP_NAME}</h1>
        <p className="lede">
          Built only for {HOUSEHOLD}. Not a public product. Award and cash numbers are
          pasted in — nothing is scraped live.
        </p>
        <div className="who">
          <button type="button" className={traveler === 'Robert Reagan' ? 'selected' : ''} onClick={() => setTraveler('Robert Reagan')}>
            Robert
          </button>
          <button type="button" className={traveler === 'Rhonda Reagan' ? 'selected' : ''} onClick={() => setTraveler('Rhonda Reagan')}>
            Rhonda
          </button>
        </div>
        <label className="field">
          Household passphrase
          <input
            type="password"
            autoComplete="current-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={`Try ${DEMO_PASSPHRASE} on first run`}
          />
        </label>
        {error ? <p className="banner warn">{error}</p> : null}
        <div className="progress-actions">
          <button className="btn" type="submit">Open the desk</button>
        </div>
        <p className="hint" style={{ marginTop: 16 }}>{POLICY.dealFirst}</p>
      </form>
    </div>
  )
}
