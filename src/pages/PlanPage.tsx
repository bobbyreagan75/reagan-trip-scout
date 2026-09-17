import { WhereStep } from '../components/wizard/WhereStep'
import { WhenStep } from '../components/wizard/WhenStep'
import { ConstraintsStep } from '../components/wizard/ConstraintsStep'
import { PositioningStep } from '../components/wizard/PositioningStep'
import { SearchStep } from '../components/wizard/SearchStep'
import { VerifyStep } from '../components/wizard/VerifyStep'
import { PayStep } from '../components/wizard/PayStep'
import { LodgeStep } from '../components/wizard/LodgeStep'
import { BriefStep } from '../components/wizard/BriefStep'
import { suggestAirportForDestination } from '../data/destinations'
import { useApp } from '../context/AppContext'
import { newId } from '../lib/format'
import { flightOrigin } from '../lib/tripDefaults'
import type { TripDraft, WizardStep } from '../types'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'where', label: 'Where' },
  { id: 'when', label: 'When' },
  { id: 'constraints', label: 'Party' },
  { id: 'position', label: 'ORF' },
  { id: 'search', label: 'Search' },
  { id: 'verify', label: 'Score' },
  { id: 'pay', label: 'Pay' },
  { id: 'lodge', label: 'Stay' },
  { id: 'brief', label: 'Brief' },
]

const ORDER: WizardStep[] = STEPS.map((s) => s.id)

export function PlanPage() {
  const { trip, setTrip, balances, settings, session, setWatches } = useApp()
  const hyattPoints = balances.find((row) => row.key === 'Hyatt_Rhonda')?.amount ?? 0

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

  function saveWatchFromSearch() {
    const origin = flightOrigin(trip.isDomestic)
    const dest = trip.destinationMode === 'deal_first'
      ? 'ANY'
      : suggestAirportForDestination(trip.destination, trip.isDomestic)
    setWatches((rows) => [
      ...rows,
      {
        id: newId('watch'),
        metal: trip.isDomestic ? '' : 'TBD',
        program: 'Watch from trip plan',
        origin,
        destination: dest,
        cabin: trip.constraints.cabin,
        maxMiles: 75000,
        seatsNeeded: trip.constraints.partySize,
        windowStart: trip.timeframe.startDate,
        windowEnd: trip.timeframe.endDate,
        notes: `Saved from ${trip.destination || 'deal-first'} plan.`,
      },
    ])
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
      {trip.step === 'constraints' && <ConstraintsStep trip={trip} onChange={patch} onBack={() => shift(-1)} onNext={() => go('position')} />}
      {trip.step === 'position' && (
        <PositioningStep trip={trip} onChange={patch} onBack={() => go('constraints')} onNext={() => go('search')} />
      )}
      {trip.step === 'search' && (
        <SearchStep
          trip={trip}
          seatsApiKey={settings.seatsApiKey}
          onChange={patch}
          onBack={() => go('position')}
          onNext={() => go('verify')}
          onSaveWatch={saveWatchFromSearch}
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
      {trip.step === 'lodge' && (
        <LodgeStep
          trip={trip}
          hyattAwards={settings.hyattAwards}
          pointsOnHand={hyattPoints}
          onChange={patch}
          onBack={() => go('pay')}
          onNext={() => go('brief')}
        />
      )}
      {trip.step === 'brief' && (
        <BriefStep
          trip={trip}
          balances={balances}
          askedBy={session?.traveler ?? 'Household'}
          hyattAwards={settings.hyattAwards}
          onBack={() => shift(-1)}
        />
      )}
    </div>
  )
}
