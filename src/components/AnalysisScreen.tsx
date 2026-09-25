import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getDataProvider } from '../data'
import type { AgentId, AgentOutput, AgentStatus } from '../data/scenarios'
import { cx } from '../lib/cx'
import { useDemoStore } from '../store/demoStore'
import {
  IconBack,
  IconBars,
  IconCheck,
  IconChevron,
  IconDb,
  IconFile,
  IconFlag,
  IconHistory,
  IconNodes,
} from './Icons'

const BEAT = 1300
const STATUS: Record<AgentStatus, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: 'Подтверждено', color: 'text-bad', bg: 'bg-bad/10', border: 'border-bad/40' },
  recovered: { label: 'Восстановлено', color: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/40' },
  unavailable: { label: 'Недоступно', color: 'text-ink-300', bg: 'bg-ink-700/30', border: 'border-ink-600/40' },
}

const ICONS: Record<AgentId, typeof IconFile> = {
  expert: IconFile,
  statistic: IconBars,
  detective: IconHistory,
  analyst: IconNodes,
}

const STEPS = ['Эксперт', 'Статистика', 'Детектив', 'Аналитик']
const AGENT_COUNT = 4

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cx(
              'flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] transition-colors',
              step > index && 'border-ok/40 bg-ok/20 text-ok',
              step === index && 'animate-glow-pulse border-accent/50 bg-accent/20 text-accent',
              step < index && 'border-ink-600/40 bg-ink-800 text-ink-400',
            )}
          >
            {step > index ? <IconCheck className="h-3 w-3" /> : index + 1}
          </div>
          {index < STEPS.length - 1 && (
            <div className={cx('h-px w-6', step > index ? 'bg-ok/40' : 'bg-ink-600/40')} />
          )}
        </div>
      ))}
    </div>
  )
}

export function AnalysisScreen() {
  const selected = useDemoStore((state) => state.selected)
  const setScreen = useDemoStore((state) => state.setScreen)
  const markResolved = useDemoStore((state) => state.markResolved)
  const [step, setStep] = useState(-1)
  const [openId, setOpenId] = useState<AgentId | null>(null)
  const [liveMode, setLiveMode] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const liveRef = useRef(liveMode)
  liveRef.current = liveMode
  const investigation = selected ? getDataProvider().getInvestigation(selected.id) : null

  useEffect(() => {
    if (!investigation) return
    setStep(-1)
    setStreamText('')
    setStreaming(false)
    const timers: number[] = []
    let stopStream = () => {}
    for (let index = 0; index < AGENT_COUNT; index += 1) {
      timers.push(window.setTimeout(() => setStep(index), 500 + index * BEAT))
    }
    timers.push(
      window.setTimeout(() => {
        const summary = investigation.agents.find((agent) => agent.id === 'analyst')?.output.summary ?? ''
        if (!liveRef.current) {
          timers.push(window.setTimeout(() => setStep(AGENT_COUNT), BEAT))
          return
        }
        setStreaming(true)
        setStreamText('')
        let acc = ''
        stopStream = getDataProvider().getLiveAnalysis(investigation.id, (token) => {
          acc += token
          setStreamText(acc)
          if (acc.length >= summary.length) {
            setStreaming(false)
            setStep(AGENT_COUNT)
          }
        })
      }, 500 + 3 * BEAT),
    )
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      stopStream()
    }
  }, [investigation?.id])

  if (!selected || !investigation) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-300">Сценарий не выбран</div>
    )
  }

  const done = step >= AGENT_COUNT

  return (
    <div className="radial-glow flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink-700/50 px-8 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScreen('alerts')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600/40 bg-ink-800 transition-colors hover:bg-ink-700"
          >
            <IconBack className="h-4 w-4 text-ink-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-50">Разбор алерта</h1>
            <p className="font-mono text-xs text-ink-300">{investigation.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-pressed={liveMode}
            onClick={() => setLiveMode((value) => !value)}
            className={cx(
              'min-h-10 rounded-lg border px-3 font-mono text-xs transition-colors',
              liveMode ? 'border-accent/50 bg-accent/15 text-accent' : 'border-ink-600/40 bg-ink-800 text-ink-300',
            )}
          >
            Живой режим
          </button>
          <Stepper step={step} />
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="relative mx-auto max-w-[1300px]">
          <LinkLayer step={step} />
          <div className="relative z-10 mb-12 flex justify-between px-[5%]">
            {investigation.sources.map((source) => {
              const agentIndex = source.id === 'data_contracts' ? 0 : source.id === 'attr_links' ? 1 : 2
              const active = step === agentIndex
              return (
                <motion.div
                  key={source.id}
                  animate={{ scale: active ? 1.05 : 1, opacity: active ? 1 : 0.5 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={cx(
                      'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                      active
                        ? 'border-accent/60 bg-accent/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : 'border-ink-600/40 bg-ink-850/60',
                    )}
                  >
                    <IconDb className={cx('h-5 w-5', active ? 'text-accent' : 'text-ink-400')} />
                  </div>
                  <p className={cx('font-mono text-xs', active ? 'text-accent' : 'text-ink-300')}>{source.label}</p>
                  <p className="text-[10px] text-ink-400">{source.sublabel}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {investigation.agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                index={index}
                label={agent.label}
                description={agent.description}
                agentId={agent.id}
                output={agent.output}
                active={step === index}
                finished={step > index}
                expanded={openId === agent.id}
                onToggle={() => setOpenId((current) => (current === agent.id ? null : agent.id))}
                streaming={agent.id === 'analyst' && streaming}
                streamText={agent.id === 'analyst' && (streaming || streamText.length > 0) ? streamText : null}
              />
            ))}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex justify-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    markResolved(investigation.id)
                    setScreen('verdict')
                  }}
                  className="flex items-center gap-2.5 rounded-xl border border-accent/50 bg-accent/15 px-8 py-3.5 text-base font-medium text-accent transition-colors hover:bg-accent/25"
                >
                  <IconFlag className="h-5 w-5" />
                  Смотреть вердикт
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function LinkLayer({ step }: { step: number }) {
  const links = [
    { active: step === 0, done: step > 0, x1: '16.5%', x2: '12.5%' },
    { active: step === 1, done: step > 1, x1: '50%', x2: '37.5%' },
    { active: step === 2, done: step > 2, x1: '83.5%', x2: '62.5%' },
  ]
  return (
    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
      {links.map((link) => (
        <path
          key={link.x1}
          d={`M ${link.x1} 70 L ${link.x2} 150`}
          fill="none"
          stroke={link.active ? '#22d3ee' : link.done ? '#0a6b4f' : '#243352'}
          strokeWidth="2"
          strokeDasharray={link.active ? '6 4' : '0'}
          className={link.active ? 'animate-dash-flow' : undefined}
          opacity={link.active ? 0.9 : link.done ? 0.5 : 0.3}
        />
      ))}
      {step >= 3 &&
        [0, 1, 2].map((index) => (
          <path
            key={index}
            d={`M ${12.5 + index * 25}% 210 Q 50% 180, 87.5% 210`}
            fill="none"
            stroke={step === 3 ? '#22d3ee' : '#0a6b4f'}
            strokeWidth="2"
            strokeDasharray={step === 3 ? '6 4' : '0'}
            className={step === 3 ? 'animate-dash-flow' : undefined}
            opacity={step === 3 ? 0.9 : 0.5}
          />
        ))}
    </svg>
  )
}

function AgentCard({
  index,
  label,
  description,
  agentId,
  output,
  active,
  finished,
  expanded,
  onToggle,
  streaming,
  streamText,
}: {
  index: number
  label: string
  description: string
  agentId: AgentId
  output: AgentOutput
  active: boolean
  finished: boolean
  expanded: boolean
  onToggle: () => void
  streaming: boolean
  streamText: string | null
}) {
  const Icon = ICONS[agentId]
  const tone = STATUS[output.status]
  const visible = active || finished
  const shownText = streamText !== null ? streamText : output.summary
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cx(
        'relative rounded-xl border p-5 transition-colors duration-300',
        active && 'border-accent/50 bg-accent/5 shadow-[0_0_24px_rgba(34,211,238,0.15)]',
        !active && finished && 'border-ok/20 bg-ok/5',
        !active && !finished && 'border-ink-600/40 bg-ink-850/60',
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={cx(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            active && 'bg-accent/20 text-accent',
            !active && finished && 'bg-ok/15 text-ok',
            !active && !finished && 'bg-ink-700/40 text-ink-400',
          )}
        >
          {active ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-100">{label}</h3>
          <p className="font-mono text-[10px] text-ink-400">
            {streaming ? 'живой вызов ИИ' : `agent #${index + 1}`}
          </p>
        </div>
      </div>
      <p className="mb-3 min-h-8 text-xs leading-relaxed text-ink-300">{description}</p>
      <AnimatePresence>
        {visible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            {!streaming && (
              <span className={cx('mb-2 inline-block rounded border px-2 py-0.5 font-mono text-[10px] font-semibold', tone.color, tone.bg, tone.border)}>
                {tone.label}
              </span>
            )}
            <p className="text-xs leading-relaxed text-ink-100">
              {shownText}
              {streaming && <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-accent" />}
            </p>
            {!streaming && (
              <button
                type="button"
                onClick={onToggle}
                className="mt-2 flex min-h-10 items-center gap-1 font-mono text-[10px] text-accent/70 transition-colors hover:text-accent"
              >
                <IconChevron className="h-3 w-3" down={expanded} />
                {expanded ? 'скрыть детали' : 'техническая деталь'}
              </button>
            )}
            {expanded && !streaming && (
              <code className="mt-2 block rounded border border-ink-700/40 bg-ink-900/60 p-2 font-mono text-[10px] leading-relaxed text-ink-300">
                {output.detail}
              </code>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {finished && (
        <div className="absolute right-3 top-3">
          <IconCheck className="h-4 w-4 text-ok" />
        </div>
      )}
    </motion.article>
  )
}
