import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getDataProvider } from '../data'
import type { AgentId, AgentOutput, AgentStatus } from '../data/scenarios'
import { cx } from '../lib/cx'
import { useDemoStore } from '../store/demoStore'
import { AssistantAvatar, JourneyHeader } from './journey/Shell'
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
  const caseId = useDemoStore((state) => state.caseId)
  const go = useDemoStore((state) => state.go)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
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
    <div className={cx('flex min-h-screen flex-col', journey ? 'aij-bg' : 'radial-glow')}>
      {journey ? (
        <JourneyHeader
          title="Разбор проблемы данных"
          subtitle={`${investigation.title} · ${journey.eventId}`}
          onBack={() => setScreen('arm')}
          right={
            <div className="flex items-center gap-4">
              <LiveToggle liveMode={liveMode} onToggle={() => setLiveMode((value) => !value)} />
              <Stepper step={step} />
            </div>
          }
        />
      ) : (
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
            <LiveToggle liveMode={liveMode} onToggle={() => setLiveMode((value) => !value)} />
            <Stepper step={step} />
          </div>
        </header>
      )}

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="relative mx-auto max-w-[1300px]">
          <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ...investigation.sources,
              { id: 'llm_synthesis', label: 'GigaChat · синтез', sublabel: 'Выводы агентов 1–3' },
            ].map((source, index) => {
              const active = step === index
              const finished = step > index
              return (
                <div key={source.id} className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: active ? 1.05 : 1, opacity: active || finished ? 1 : 0.5 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cx(
                        'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                        active
                          ? 'border-accent/60 bg-accent/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                          : finished
                            ? 'border-ok/30 bg-ok/5'
                            : 'border-ink-600/40 bg-ink-850/60',
                      )}
                    >
                      {index === 3 ? (
                        <IconNodes className={cx('h-5 w-5', active ? 'text-accent' : finished ? 'text-ok' : 'text-ink-400')} />
                      ) : (
                        <IconDb className={cx('h-5 w-5', active ? 'text-accent' : finished ? 'text-ok' : 'text-ink-400')} />
                      )}
                    </div>
                    <p className={cx('font-mono text-[13px]', active ? 'text-accent' : 'text-ink-200')}>{source.label}</p>
                    <p className="text-[11px] text-ink-400">{source.sublabel}</p>
                  </motion.div>
                  <SourceLink active={active} finished={finished} />
                </div>
              )
            })}
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            {done && journey?.analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass relative z-10 mt-8 flex items-center gap-6 rounded-2xl p-6"
              >
                <AssistantAvatar size={52} />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-mono text-[12px] tracking-[0.12em] text-ink-400 uppercase">Итог разбора</p>
                  <p className="text-xl font-semibold text-ink-50">{journey.analysis.headline}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-300">{journey.analysis.text}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2.5">
                  {journey.analysis.kind === 'needs_rca' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => go('rca')}
                        className="btn-aij rounded-xl px-7 py-4 text-[17px]"
                      >
                        Найти первопричину (RCA)
                      </button>
                      <button
                        type="button"
                        onClick={() => go('rule')}
                        className="btn-ghost rounded-xl px-7 py-3 text-[15px]"
                      >
                        Сразу к правилу
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => go('rule')}
                      className="btn-aij rounded-xl px-7 py-4 text-[17px]"
                    >
                      Скорректировать правило
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            {done && !journey && (
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

/** Связь «источник → агент»: течёт, пока агент ходит в источник за данными. */
function SourceLink({ active, finished }: { active: boolean; finished: boolean }) {
  return (
    <svg width="12" height="56" viewBox="0 0 12 56" className="my-1 overflow-visible" aria-hidden>
      <line
        x1="6"
        y1="0"
        x2="6"
        y2="50"
        stroke={active ? '#22d3ee' : finished ? '#34d399' : '#243352'}
        strokeWidth="2"
        strokeDasharray={active ? '6 4' : '0'}
        className={active ? 'animate-dash-flow' : undefined}
        opacity={active ? 1 : finished ? 0.6 : 0.5}
      />
      <path d="M1 48 L6 55 L11 48" fill="none" stroke={active ? '#22d3ee' : finished ? '#34d399' : '#243352'} strokeWidth="2" opacity={active ? 1 : finished ? 0.6 : 0.5} />
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
          <h3 className="text-base font-semibold text-ink-100">{label}</h3>
          <p className="font-mono text-[10px] text-ink-400">
            {streaming ? 'живой вызов ИИ' : `agent #${index + 1}`}
          </p>
        </div>
      </div>
      <p className="mb-3 min-h-10 text-sm leading-relaxed text-ink-300">{description}</p>
      <AnimatePresence>
        {visible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            {!streaming && (
              <span className={cx('mb-2 inline-block rounded border px-2 py-0.5 font-mono text-[10px] font-semibold', tone.color, tone.bg, tone.border)}>
                {tone.label}
              </span>
            )}
            <p className="text-[15px] leading-relaxed text-ink-100">
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

function LiveToggle({ liveMode, onToggle }: { liveMode: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={liveMode}
      onClick={onToggle}
      className={cx(
        'min-h-10 rounded-lg border px-3 font-mono text-xs transition-colors',
        liveMode ? 'border-accent/50 bg-accent/15 text-accent' : 'border-ink-600/40 bg-ink-800 text-ink-300',
      )}
    >
      Живой режим
    </button>
  )
}
