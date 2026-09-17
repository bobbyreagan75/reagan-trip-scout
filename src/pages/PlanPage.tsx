import { WhereStep } from '../components/wizard/WhereStep'
import { WhenStep } from '../components/wizard/WhenStep'
import { ConstraintsStep } from '../components/wizard/ConstraintsStep'
import { SearchStep } from '../components/wizard/SearchStep'
import { VerifyStep } from '../components/wizard/VerifyStep'
import { PayStep } from '../components/wizard/PayStep'
import { LodgeStep } from '../components/wizard/LodgeStep'
import { BriefStep } from '../components/wizard/BriefStep'
import { useApp } from '../context/AppContext'
import type { TripDraft, WizardStep } from '../types'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'where', label: 'Where' },
  { id: 'when', label: 'When' },
  { id: 'constraints', label: 'Party' },
  { id: 'search', label: 'Search' },
  { id: 'verify', label: 'Score' },
  { id: 'pay', label: 'Pay' },
  { id: 'lodge', label: 'Stay' },
  { id: 'brief', label: 'Brief' },
]

const ORDER: WizardStep[] = STEPS.map((s) => s.id)

export function PlanPage() {
  const { trip, setTrip, balances, settings, session } = useApp()

  function patch(next: Partial<TripDraft>) {
    setTrip({ ...trip, ...next })
  }

  function go(step: WizardStep) {
    patch({ step })
  }

  function shift(delta: number) {
    const idx = ORDER.indexOf(trip.step)
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, idx + delta))]
    go(next)
  }

  return (
    <div className="narrow" style={{ width: 'min(720px, 100%)', margin: '0 auto' }}>
      <nav className="stepper" aria-label="Trip wizard">
        {STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            className={trip.step === step.id ? 'current' : ''}
            onClick={() => go(step.id)}
          >
            {step.label}
          </button>
        ))}
      </nav>

      {trip.step === 'where' && <WhereStep trip={trip} onChange={patch} onNext={() => go('when')} />}
      {trip.step === 'when' && <WhenStep trip={trip} onChange={patch} onBack={() => shift(-1)} onNext={() => go('constraints')} />}
      {trip.step === 'constraints' && <ConstraintsStep trip={trip} onChange={patch} onBack={() => shift(-1)} onNext={() => go('search')} />}
      {trip.step === 'search' && (
        <SearchStep
          trip={trip}
          seatsApiKey={settings.seatsApiKey}
          onChange={patch}
          onBack={() => shift(-1)}
          onNext={() => go('verify')}
        />
      )}
      {trip.step === 'verify' && (
        <VerifyStep
          trip={trip}
          balances={balances}
          onChange={patch}
          onBack={() => go('search')}
          onNext={() => go('pay')}
        />
      )}
      {trip.step === 'pay' && (
        <PayStep
          trip={trip}
          balances={balances}
          onChange={patch}
          onBack={() => go('verify')}
          onNext={() => go('lodge')}
        />
      )}
      {trip.step === 'lodge' && <LodgeStep trip={trip} onChange={patch} onBack={() => shift(-1)} onNext={() => go('brief')} />}
      {trip.step === 'brief' && (
        <BriefStep
          trip={trip}
          balances={balances}
          askedBy={session?.traveler ?? 'Household'}
          onBack={() => shift(-1)}
        />
      )}
    </div>
  )
}
