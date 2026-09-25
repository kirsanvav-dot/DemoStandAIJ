import { motion } from 'framer-motion'
import { scenarios, type Scenario } from '../data/scenarios'
import { cx } from '../lib/cx'
import { useDemoStore } from '../store/demoStore'
import { IconAlert, IconArrow, IconBack, IconCheck, IconClock, IconRadio } from './Icons'

const SEVERITY = {
  3: { label: 'Критический', color: 'text-bad', bg: 'bg-bad/10', border: 'border-bad/40' },
  2: { label: 'Высокий', color: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/40' },
  1: { label: 'Средний', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/40' },
} as const

function AlertCard({
  scenario,
  index,
  resolved,
  onClick,
}: {
  scenario: Scenario
  index: number
  resolved: boolean
  onClick: () => void
}) {
  const tone = SEVERITY[scenario.severity]
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className={cx(
        'group relative rounded-xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        resolved ? 'border-ok/30 bg-ok/5 opacity-70' : `${tone.border} ${tone.bg} hover:border-accent/50`,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={cx('rounded border px-2 py-0.5 font-mono text-[10px] font-semibold', tone.color, tone.bg, tone.border)}>
            {tone.label}
          </span>
          {resolved ? (
            <span className="flex items-center gap-1 rounded border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
              <IconCheck className="h-2.5 w-2.5" />
              разобрано
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              новый
            </span>
          )}
        </div>
        <IconArrow className="h-4 w-4 text-ink-400 transition-all group-hover:translate-x-1 group-hover:text-accent" />
      </div>
      <h3 className="mb-1.5 text-base font-semibold leading-snug text-ink-50">{scenario.title}</h3>
      <div className="mb-3 flex items-center gap-4 font-mono text-xs text-ink-300">
        <span className="flex items-center gap-1">
          <IconRadio className="h-3 w-3" />
          {scenario.channel}
        </span>
        <span className="flex items-center gap-1">
          <IconClock className="h-3 w-3" />
          {scenario.timestamp}
        </span>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-ink-200">{scenario.downstream}</p>
      <div className="mt-3 flex items-center gap-2 border-t border-ink-700/40 pt-3">
        <span className="font-mono text-[10px] text-ink-400">атрибут:</span>
        <code className="font-mono text-[10px] text-accent/80">{scenario.attributeName}</code>
      </div>
    </motion.button>
  )
}

export function AlertsScreen() {
  const setScreen = useDemoStore((state) => state.setScreen)
  const selectScenario = useDemoStore((state) => state.selectScenario)
  const resolved = useDemoStore((state) => state.resolved)

  return (
    <div className="radial-glow flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink-700/50 px-8 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScreen('pipeline')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600/40 bg-ink-800 transition-colors hover:bg-ink-700"
          >
            <IconBack className="h-4 w-4 text-ink-300" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-bad/30 bg-bad/10">
            <IconAlert className="h-5 w-5 text-bad" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-50">Входящие алерты</h1>
            <p className="font-mono text-xs text-ink-300">
              {scenarios.length} активных · {resolved.length} разобрано
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-ink-300">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-bad" />
          <span>поток алертов активен</span>
        </div>
      </header>
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-2">
          {scenarios.map((scenario, index) => (
            <AlertCard
              key={scenario.id}
              scenario={scenario}
              index={index}
              resolved={resolved.includes(scenario.id)}
              onClick={() => selectScenario(scenario)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
