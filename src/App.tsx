import { AnimatePresence, motion } from 'framer-motion'
import { AlertsScreen } from './components/AlertsScreen'
import { AnalysisScreen } from './components/AnalysisScreen'
import { FlowScreen } from './components/FlowScreen'
import { ArmScreen } from './components/journey/ArmScreen'
import { ConditionsScreen } from './components/journey/ConditionsScreen'
import { RcaScreen } from './components/journey/RcaScreen'
import { RuleScreen } from './components/journey/RuleScreen'
import { VerdictScreen } from './components/VerdictScreen'
import { useIdleReset } from './hooks/useIdleReset'
import { useDemoStore } from './store/demoStore'

/** Киоск: без касаний 2 минуты — возвращаемся на заставку и сбрасываем прогресс. */
const IDLE_SECONDS = 120

export default function App() {
  const screen = useDemoStore((state) => state.screen)
  const reset = useDemoStore((state) => state.reset)
  useIdleReset(screen !== 'pipeline', IDLE_SECONDS, reset)

  return (
    <div className="min-h-screen bg-ink-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {screen === 'pipeline' && <FlowScreen />}
          {screen === 'arm' && <ArmScreen />}
          {screen === 'analysis' && <AnalysisScreen />}
          {screen === 'rca' && <RcaScreen />}
          {screen === 'conditions' && <ConditionsScreen />}
          {screen === 'rule' && <RuleScreen />}
          {screen === 'alerts' && <AlertsScreen />}
          {screen === 'verdict' && <VerdictScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
