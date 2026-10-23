import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDataProvider } from '../../data'
import { cx } from '../../lib/cx'
import { useDemoStore } from '../../store/demoStore'
import { IconArrow, IconCheck, IconDb } from '../Icons'
import { LatencyChart } from './LatencyChart'
import { AssistantAvatar, JourneyHeader, SectionLabel } from './Shell'

const STEP_MS = 2400

export function RcaScreen() {
  const caseId = useDemoStore((state) => state.caseId)
  const go = useDemoStore((state) => state.go)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
  const rca = journey?.rca ?? null
  const [step, setStep] = useState(-1)
  const [openDetail, setOpenDetail] = useState<number | null>(null)

  useEffect(() => {
    if (!rca) return
    const timers = rca.steps.map((_, index) => window.setTimeout(() => setStep(index), 600 + index * STEP_MS))
    timers.push(window.setTimeout(() => setStep(rca.steps.length), 600 + rca.steps.length * STEP_MS))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [rca])

  if (!journey || !rca) {
    return <div className="aij-bg flex h-screen items-center justify-center text-ink-300">Кейс не выбран</div>
  }

  const done = step >= rca.steps.length
  const chartStep = rca.steps.findIndex((item) => item.chart)
  const showChart = chartStep >= 0 && step >= chartStep

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="RCA · поиск первопричины"
        subtitle={`Почему не пришёл ${journey.attribute ?? 'атрибут'} · ${journey.eventId}`}
        onBack={() => go('chat')}
        right={
          <div className="flex items-center gap-3">
            <AssistantAvatar size={36} thinking={!done} />
            <p className="text-[15px] text-ink-300">
              {done ? 'Первопричина найдена' : 'RCA-агент идёт глубже данных: трейсы, метрики, релизы'}
            </p>
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 gap-6 px-8 py-6">
        <div className="flex min-w-0 flex-[1.15] flex-col overflow-auto pr-1">
          <SectionLabel>ход расследования</SectionLabel>
          <ol className="relative space-y-3">
            {rca.steps.map((item, index) => {
              const active = step === index
              const finished = step > index
              const visible = step >= index
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: visible ? 1 : 0.35 }}
                  className={cx(
                    'glass rounded-2xl p-5 transition-colors',
                    active && 'border-aij-teal/50 shadow-[0_0_30px_rgba(63,224,197,0.12)]',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cx(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[13px]',
                        finished && 'border-ok/40 bg-ok/15 text-ok',
                        active && 'border-aij-teal/60 bg-aij-teal/15 text-aij-teal',
                        !visible && 'border-white/10 text-ink-400',
                      )}
                    >
                      {finished ? <IconCheck className="h-4 w-4" /> : active ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-aij-teal/30 border-t-aij-teal" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[17px] font-semibold text-ink-50">{item.title}</p>
                        <p className="shrink-0 font-mono text-[12px] text-ink-400">{item.source}</p>
                      </div>
                      <AnimatePresence>
                        {visible && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <p className="mt-2 text-[16px] leading-relaxed text-ink-100">
                              {active ? <span className="text-ink-300">запрос к источнику…</span> : item.finding}
                            </p>
                            {finished && (
                              <button
                                type="button"
                                onClick={() => setOpenDetail((current) => (current === index ? null : index))}
                                className="mt-2 font-mono text-[12px] text-aij-teal/80 hover:text-aij-teal"
                              >
                                {openDetail === index ? 'скрыть деталь' : 'техническая деталь'}
                              </button>
                            )}
                            {finished && openDetail === index && (
                              <code className="mt-2 block rounded-lg border border-white/8 bg-black/30 p-2.5 font-mono text-[12px] text-ink-300">
                                {item.detail}
                              </code>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>

        <div className="flex min-h-0 w-[640px] shrink-0 flex-col gap-4 overflow-auto *:shrink-0">
          <div className="glass rounded-2xl p-5">
            <SectionLabel>источники RCA-агента</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {rca.steps.map((item, index) => (
                <div
                  key={item.source}
                  className={cx(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all',
                    step === index
                      ? 'border-aij-teal/60 bg-aij-teal/10 text-aij-teal shadow-[0_0_20px_rgba(63,224,197,0.2)]'
                      : step > index
                        ? 'border-ok/25 bg-ok/5 text-ink-100'
                        : 'border-white/8 text-ink-400',
                  )}
                >
                  <IconDb className="h-4 w-4 shrink-0" />
                  <span className="text-[14px]">{item.source}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass grow rounded-2xl p-5">
            <SectionLabel>fingerprint-service · время ответа p99</SectionLabel>
            {showChart ? (
              <LatencyChart data={rca.latency} timeoutMs={rca.timeoutMs} releaseAfter="13:40" />
            ) : (
              <div className="flex h-[240px] items-center justify-center text-[14px] text-ink-400">
                появится, когда агент дойдёт до метрик
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mb-6 flex items-center gap-6 rounded-2xl border border-aij-teal/35 bg-[#071a22]/90 p-6"
          >
            <AssistantAvatar size={52} />
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[12px] tracking-[0.12em] text-aij-teal uppercase">первопричина</p>
              <p className="text-[18px] leading-relaxed text-ink-50">{rca.conclusion}</p>
            </div>
            <button
              type="button"
              onClick={() => go('rule')}
              className="btn-aij flex shrink-0 items-center gap-2 rounded-xl px-7 py-4 text-[17px]"
            >
              Поправить правило
              <IconArrow className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
