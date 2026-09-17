import { Layout } from './components/Layout'
import { useApp } from './context/AppContext'
import { BalancesPage } from './pages/BalancesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PlanPage } from './pages/PlanPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { session, view, ready } = useApp()

  if (!ready) {
    return (
      <div className="login-wrap">
        <p className="muted">Opening the household desk…</p>
      </div>
    )
  }

  if (!session) return <LoginPage />

  return (
    <Layout>
      {view === 'home' && <HomePage />}
      {view === 'plan' && <PlanPage />}
      {view === 'balances' && <BalancesPage />}
      {view === 'settings' && <SettingsPage />}
    </Layout>
  )
}
