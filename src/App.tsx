import { AnimatePresence, motion } from 'framer-motion'
import { AlertsScreen } from './components/AlertsScreen'
import { AnalysisScreen } from './components/AnalysisScreen'
import { FlowScreen } from './components/FlowScreen'
import { VerdictScreen } from './components/VerdictScreen'
import { useDemoStore } from './store/demoStore'

export default function App() {
  const screen = useDemoStore((state) => state.screen)
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
          {screen === 'alerts' && <AlertsScreen />}
          {screen === 'analysis' && <AnalysisScreen />}
          {screen === 'verdict' && <VerdictScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
