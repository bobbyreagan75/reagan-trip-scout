import type { ReactNode } from 'react'
import { APP_NAME, HOUSEHOLD } from '../data/household'
import { useApp } from '../context/AppContext'
import type { View } from '../types'

const LINKS: { id: View; label: string }[] = [
  { id: 'home', label: 'Desk' },
  { id: 'plan', label: 'Plan' },
  { id: 'watch', label: 'Watch' },
  { id: 'jal', label: 'JAL' },
  { id: 'balances', label: 'Balances' },
  { id: 'settings', label: 'Settings' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { view, setView, session, logout } = useApp()
  const first = session?.traveler.split(' ')[0] ?? 'Scout'

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          <span className="mark">R</span>
          <span>
            {APP_NAME}
            <small>{HOUSEHOLD}</small>
          </span>
        </button>
        <nav className="nav">
          {LINKS.map((link) => (
            <button
              key={link.id}
              className={view === link.id ? 'active' : ''}
              onClick={() => setView(link.id)}
            >
              {link.label}
            </button>
          ))}
          <span className="chip">{first}</span>
          <button className="btn-ghost" onClick={logout}>Lock</button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
