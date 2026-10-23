import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AlertsScreen } from './components/AlertsScreen'
import { AnalysisScreen } from './components/AnalysisScreen'
import { FlowScreen } from './components/FlowScreen'
import { ArmScreen } from './components/journey/ArmScreen'
import { ChatScreen } from './components/journey/ChatScreen'
import { RcaScreen } from './components/journey/RcaScreen'
import { ReportScreen } from './components/journey/ReportScreen'
import { RuleScreen } from './components/journey/RuleScreen'
import { VerdictScreen } from './components/VerdictScreen'
import { useIdleReset } from './hooks/useIdleReset'
import { useDemoStore } from './store/demoStore'

/** Киоск: без касаний 2 минуты — возвращаемся на заставку и сбрасываем прогресс. */
const IDLE_SECONDS = 120

/** Экраны свёрстаны под плазму 1920×1080. На другом экране вся сцена масштабируется целиком, без перекрытий. */
const STAGE_W = 1920
const STAGE_H = 1080

function useStageScale(): number {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

export default function App() {
  const screen = useDemoStore((state) => state.screen)
  const reset = useDemoStore((state) => state.reset)
  useIdleReset(screen !== 'pipeline', IDLE_SECONDS, reset)
  const scale = useStageScale()

  return (
    <div className="stage-fit">
      <div className="stage bg-ink-950" style={{ transform: `scale(${scale})` }}>
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
            {screen === 'chat' && <ChatScreen />}
            {screen === 'rca' && <RcaScreen />}
            {screen === 'rule' && <RuleScreen />}
            {screen === 'report' && <ReportScreen />}
            {screen === 'alerts' && <AlertsScreen />}
            {screen === 'verdict' && <VerdictScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
