import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getDataProvider, type PipelineEvent } from '../data'
import type { Scenario, StageDef } from '../data/scenarios'
import { cx } from '../lib/cx'
import { useDemoStore } from '../store/demoStore'
import {
  IconAlert,
  IconArrow,
  IconFlag,
  IconGrid,
  IconInbox,
  IconLayers,
  IconRadio,
  IconScale,
  IconShield,
} from './Icons'

type RunState = PipelineEvent

const INITIAL_RUN: RunState = {
  cycle: 0,
  type: 'clean',
  scenario: null,
  activeStage: -1,
  phase: 'flowing',
}

const STAGE_ICONS = [IconInbox, IconShield, IconLayers, IconGrid, IconScale, IconFlag]

function RunCaption({ run }: { run: RunState }) {
  if (run.type === 'clean') {
    return (
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 font-mono text-sm text-ok"
        >
          ● Чистый прогон
        </motion.div>
        <p className="text-xs text-ink-300">Событие проходит конвейер без потери атрибутов</p>
      </div>
    )
  }
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-1 font-mono text-sm text-bad"
      >
        ● Прогон с потерей данных
      </motion.div>
      <p className="text-sm text-ink-100">{run.scenario?.title}</p>
      <p className="mt-1 font-mono text-xs text-ink-400">
        стадия: {run.scenario?.brokenStage} · атрибут: {run.scenario?.attributeName}
      </p>
    </div>
  )
}

function StageNode({
  stage,
  index,
  run,
  brokenIdx,
}: {
  stage: StageDef
  index: number
  run: RunState
  brokenIdx: number
}) {
  const Icon = STAGE_ICONS[index] ?? IconInbox
  const isActive = run.activeStage === index
  const isBroken = run.type === 'dirty' && index === brokenIdx
  const isPastBroken = run.type === 'dirty' && brokenIdx !== -1 && index > brokenIdx && run.activeStage >= index
  const isCompleted = run.type === 'clean' && run.activeStage > index
  const showChips = isActive || isCompleted
  const struck = run.type === 'dirty' && brokenIdx !== -1 && index > brokenIdx && (isActive || isCompleted)

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center">
      <motion.div
        initial={false}
        animate={{ scale: isActive ? 1.05 : 1, opacity: isPastBroken ? 0.35 : 1 }}
        transition={{ duration: 0.3 }}
        className={cx(
          'relative w-full max-w-[180px] rounded-xl border p-4 transition-colors duration-300',
          isBroken && 'border-bad/60 bg-bad/10',
          !isBroken && isPastBroken && 'border-ink-600/30 bg-ink-850/30',
          !isBroken && !isPastBroken && isActive && 'border-accent/60 bg-accent/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]',
          !isBroken && !isPastBroken && !isActive && isCompleted && 'border-ok/30 bg-ok/5',
          !isBroken && !isPastBroken && !isActive && !isCompleted && 'border-ink-600/40 bg-ink-850/60',
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cx(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              isBroken && 'bg-bad/20 text-bad',
              !isBroken && isPastBroken && 'bg-ink-700/30 text-ink-400',
              !isBroken && !isPastBroken && isActive && 'bg-accent/20 text-accent',
              !isBroken && !isPastBroken && !isActive && isCompleted && 'bg-ok/15 text-ok',
              !isBroken && !isPastBroken && !isActive && !isCompleted && 'bg-ink-700/40 text-ink-300',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-mono text-[10px] text-ink-400">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="text-sm font-medium leading-tight text-ink-100">{stage.label}</h3>
        <p className="mt-0.5 font-mono text-[10px] text-ink-400">{stage.sublabel}</p>
        <div className="mt-3 space-y-1">
          <AnimatePresence>
            {showChips &&
              stage.attributes.map((attribute, chipIndex) => {
                const missing =
                  isBroken && run.scenario && stage.id === run.scenario.brokenStage && attribute === run.scenario.missingChip
                return (
                  <motion.div
                    key={attribute}
                    initial={{ opacity: 0, x: -10, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1 + chipIndex * 0.05, duration: 0.3 }}
                    className={cx(
                      'flex items-center gap-1.5 truncate rounded border px-2 py-1 font-mono text-[10px]',
                      missing && 'border-bad/40 bg-bad/15 text-bad',
                      !missing && struck && 'border-ink-600/30 bg-ink-700/20 text-ink-400 line-through',
                      !missing && !struck && 'border-ink-600/30 bg-ink-700/30 text-ink-200',
                    )}
                  >
                    {missing ? (
                      <IconAlert className="h-2.5 w-2.5 shrink-0" />
                    ) : (
                      <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                    )}
                    <span className="truncate">{attribute}</span>
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function Connector({ broken, passed }: { broken: boolean; passed: boolean }) {
  return (
    <svg className="h-10 w-8 shrink-0 overflow-visible" aria-hidden>
      <line
        x1="0"
        y1="20"
        x2="32"
        y2="20"
        stroke={broken ? '#f87171' : passed ? '#22d3ee' : '#243352'}
        strokeWidth="2"
        strokeDasharray={broken ? '6 4' : '0'}
        className={broken ? 'animate-dash-flow' : undefined}
        opacity={broken ? 0.6 : passed ? 0.8 : 0.4}
      />
    </svg>
  )
}

function EventPill({ run, brokenIdx }: { run: RunState; brokenIdx: number }) {
  const loss = run.type === 'dirty' && run.activeStage >= brokenIdx && brokenIdx !== -1
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cx(
        'flex items-center gap-3 rounded-xl border px-6 py-4',
        loss ? 'border-bad/50 bg-bad/10' : 'border-ok/40 bg-ok/5',
      )}
    >
      <div className={cx('h-3 w-3 rounded-full', loss ? 'animate-pulse bg-bad' : 'bg-ok')} />
      <div className="text-left">
        <p className="font-mono text-sm text-ink-100">
          {loss ? 'event_id: evt_***3821 — DATA LOSS' : 'event_id: evt_***3821 — OK'}
        </p>
        <p className="font-mono text-xs text-ink-300">
          {loss
            ? `missing: ${run.scenario?.attributeName}`
            : `all attributes present · stage ${run.activeStage + 1}/6`}
        </p>
      </div>
    </motion.div>
  )
}

function AlertPill({ scenario }: { scenario: Scenario }) {
  const setScreen = useDemoStore((state) => state.setScreen)
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.6, x: -100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.6, x: 200 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => setScreen('alerts')}
      className="flex items-center gap-4 rounded-xl border border-bad/50 bg-bad/10 px-6 py-4 text-left transition-colors hover:bg-bad/20"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bad/20">
        <IconAlert className="h-5 w-5 text-bad" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-50">{scenario.title}</p>
        <p className="font-mono text-xs text-ink-300">
          {scenario.channel} · {scenario.timestamp} · severity {scenario.severity}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-1 font-mono text-xs text-bad">
        <span>перейти к алертам</span>
        <IconArrow className="h-3 w-3" />
      </div>
    </motion.button>
  )
}

export function FlowScreen() {
  const setScreen = useDemoStore((state) => state.setScreen)
  const provider = getDataProvider()
  const stages = provider.getPipelineStages()
  const [run, setRun] = useState<RunState>(INITIAL_RUN)
  const [operatorOpen, setOperatorOpen] = useState(false)
  const holdTimer = useRef<number | null>(null)

  useEffect(() => provider.subscribePipelineEvents(setRun), [provider])

  const brokenIdx =
    run.type === 'dirty' && run.scenario
      ? stages.findIndex((stage) => stage.id === run.scenario?.brokenStage)
      : -1

  const cancelHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  return (
    <div className="radial-glow relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink-700/50 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
            <IconRadio className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-50">
              Антифрод · Мониторинг качества данных
            </h1>
            <p className="font-mono text-xs text-ink-300">Pipeline data quality monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 font-mono text-xs text-ink-300">
            <span className="text-[10px] tracking-wide text-ink-400/70">{provider.modeLabel}</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-ok" />
              <span>Система активна</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setScreen('alerts')}
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <IconAlert className="h-4 w-4" />
            Смотреть алерты
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-8 py-6">
        <RunCaption run={run} />
        <div className="relative mt-8 w-full max-w-[1400px]">
          <div className="flex w-full items-stretch">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex min-w-0 flex-1 items-center">
                <StageNode stage={stage} index={index} run={run} brokenIdx={brokenIdx} />
                {index < stages.length - 1 && (
                  <Connector
                    broken={run.type === 'dirty' && index >= brokenIdx && brokenIdx !== -1 && run.activeStage > index}
                    passed={run.activeStage > index && !(run.type === 'dirty' && index >= brokenIdx && brokenIdx !== -1)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex h-32 w-full max-w-[1400px] items-center justify-center">
          <AnimatePresence mode="wait">
            {run.phase === 'alerting' && run.scenario ? (
              <AlertPill key={`alert-${run.cycle}`} scenario={run.scenario} />
            ) : run.activeStage >= 0 ? (
              <EventPill key={`event-${run.cycle}`} run={run} brokenIdx={brokenIdx} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-ink-700/50 px-8 py-3 font-mono text-xs text-ink-300">
        <div className="flex items-center gap-6">
          <span>
            throughput: <span className="text-ok">2,847 evt/s</span>
          </span>
          <span>
            p99 latency: <span className="text-ink-100">23ms</span>
          </span>
          <span>
            enrichers: <span className="text-ok">7/8 online</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ink-400">cycle</span>
          <span className="text-accent">#{run.cycle}</span>
        </div>
      </footer>
      <div
        className="absolute bottom-0 left-0 z-30 h-16 w-16"
        onPointerDown={() => {
          cancelHold()
          holdTimer.current = window.setTimeout(() => setOperatorOpen(true), 2000)
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
      />
      {operatorOpen && (
        <OperatorPanel
          alerts={provider.getAlerts()}
          onClose={() => setOperatorOpen(false)}
          onPlay={(id) => {
            provider.playDirtyRun(id)
            setOperatorOpen(false)
          }}
        />
      )}
    </div>
  )
}

function OperatorPanel({
  alerts,
  onClose,
  onPlay,
}: {
  alerts: Scenario[]
  onClose: () => void
  onPlay: (id: string) => void
}) {
  return (
    <>
      <button type="button" aria-label="закрыть" className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div className="fixed bottom-6 left-6 z-50 w-80 rounded-xl border border-ink-600/40 bg-ink-850 p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-wide text-ink-300">Сценарии</p>
          <button type="button" onClick={onClose} className="min-h-10 px-2 font-mono text-xs text-ink-300">
            закрыть
          </button>
        </div>
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between gap-3">
              <span className="text-sm leading-snug text-ink-100">{alert.title}</span>
              <button
                type="button"
                onClick={() => onPlay(alert.id)}
                className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent"
              >
                запустить
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
