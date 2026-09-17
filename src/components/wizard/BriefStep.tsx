import { useMemo, useState } from 'react'
import { COS_EMAIL } from '../../data/household'
import { useApp } from '../../context/AppContext'
import { copyText } from '../../lib/format'
import { buildTripBrief, chiefOfStaffMailto, humanTripBrief } from '../../lib/tripBrief'
import type { BalanceRow, HyattAwards, TripDraft } from '../../types'

type Props = {
  trip: TripDraft
  balances: BalanceRow[]
  askedBy: string
  hyattAwards?: HyattAwards
  onBack: () => void
}

export function BriefStep({ trip, balances, askedBy, hyattAwards, onBack }: Props) {
  const { bonuses } = useApp()
  const brief = useMemo(
    () => buildTripBrief(trip, balances, askedBy, hyattAwards, bonuses),
    [trip, balances, askedBy, hyattAwards, bonuses],
  )
  const summary = useMemo(() => humanTripBrief(brief), [brief])
  const json = useMemo(() => JSON.stringify(brief, null, 2), [brief])
  const [toast, setToast] = useState('')

  async function copy(label: string, value: string) {
    const ok = await copyText(value)
    setToast(ok ? `${label} copied.` : 'Copy was blocked by the browser.')
  }

  return (
    <article className="bubble scout">
      <div className="kicker">Chief of Staff</div>
      <h2>Continue the hunt in chat</h2>
      <p className="lede">
        This packages the trip as a brief you can paste into Grok or email {COS_EMAIL}.
        Live in-app chat is a later phase.
      </p>
      <pre className="pre">{summary}</pre>
      <div className="links">
        <button type="button" onClick={() => void copy('Summary', summary)}>Copy summary</button>
        <button type="button" onClick={() => void copy('JSON', json)}>Copy JSON brief</button>
        <a href={chiefOfStaffMailto(brief, summary)}>Email {COS_EMAIL}</a>
      </div>
      <details>
        <summary className="muted">JSON brief</summary>
        <pre className="pre">{json}</pre>
      </details>
      {toast ? <div className="toast">{toast}</div> : null}
      <div className="progress-actions">
        <button className="btn-ghost" type="button" onClick={onBack}>Back</button>
      </div>
    </article>
  )
}
