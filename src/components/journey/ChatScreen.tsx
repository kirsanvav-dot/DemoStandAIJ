import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDataProvider } from '../../data'
import { cx } from '../../lib/cx'
import { useDemoStore } from '../../store/demoStore'
import { IconArrow, IconDb } from '../Icons'
import { AssistantAvatar, JourneyHeader, SectionLabel, useTypewriter } from './Shell'

type Phase = 'idle' | 'sent' | 'answering'

const DIALOGS = [
  { name: 'Агент-ассистент', last: 'Разбор обращения готов' },
  { name: 'Дежурная смена L3', last: 'Инциденты за ночь — без изменений' },
  { name: 'Владельцы модулей', last: 'Релизы на неделю' },
]

/** Запуск RCA из рабочего чата: аналитик спрашивает агента, агент запускает сценарий. */
export function ChatScreen() {
  const caseId = useDemoStore((state) => state.caseId)
  const go = useDemoStore((state) => state.go)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
  const chat = journey?.chat ?? null
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (phase !== 'sent') return
    const timer = window.setTimeout(() => setPhase('answering'), 1200)
    return () => window.clearTimeout(timer)
  }, [phase])

  const { shown, done } = useTypewriter(chat?.ack ?? '', phase === 'answering', 45)

  if (!journey || !chat || !journey.rca) {
    return <div className="aij-bg flex h-screen items-center justify-center text-ink-300">Кейс не выбран</div>
  }

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="Рабочий чат · агент RCA"
        subtitle={`Запуск поиска первопричины по ${journey.eventId}`}
        onBack={() => go('analysis')}
      />

      <div className="flex min-h-0 flex-1 gap-6 px-8 py-6">
        <aside className="glass flex w-[340px] shrink-0 flex-col rounded-2xl p-4">
          <SectionLabel>чаты</SectionLabel>
          <div className="flex items-center gap-3 rounded-xl border border-aij-teal/40 bg-aij-teal/10 px-3 py-3">
            <AssistantAvatar size={36} thinking={phase === 'sent'} />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink-50">{chat.agent}</p>
              <p className="truncate text-[13px] text-ink-300">{phase === 'idle' ? 'в сети' : 'запускает RCA…'}</p>
            </div>
          </div>
          <ul className="mt-2 space-y-1">
            {DIALOGS.map((dialog) => (
              <li key={dialog.name} className="flex items-center gap-3 rounded-xl px-3 py-3 opacity-60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[12px] text-ink-300">
                  {dialog.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] text-ink-100">{dialog.name}</p>
                  <p className="truncate text-[13px] text-ink-400">{dialog.last}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="glass flex min-w-0 flex-1 flex-col rounded-2xl">
          <div className="flex-1 space-y-5 overflow-auto px-8 py-6">
            <div className="mx-auto max-w-[760px] rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4">
              <p className="mb-1 font-mono text-[12px] text-ink-400">контекст из АРМ · обращение {journey.eventId}</p>
              <p className="text-[16px] text-ink-50">{journey.analysis?.headline}</p>
              <p className="mt-1 text-[14px] text-ink-300">
                {journey.rule.id} «{journey.rule.name}» · пустой {journey.attribute}
              </p>
            </div>

            <AnimatePresence>
              {phase !== 'idle' && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <p className="max-w-[70%] rounded-2xl rounded-br-md bg-aij-blue/25 px-5 py-3.5 text-[17px] text-ink-50">
                    {chat.prompt}
                  </p>
                </motion.div>
              )}
              {phase !== 'idle' && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <AssistantAvatar size={40} thinking={!done} />
                  <div className="max-w-[75%] rounded-2xl rounded-tl-md border border-white/8 bg-white/[0.04] px-5 py-3.5">
                    {phase === 'sent' ? (
                      <p className="text-[16px] text-ink-300">печатает…</p>
                    ) : (
                      <p className={cx('text-[17px] leading-relaxed text-ink-50', !done && 'typing-caret')}>{shown}</p>
                    )}
                    {done && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                        <p className="mb-2 font-mono text-[12px] tracking-wide text-ink-400 uppercase">сценарий RCA</p>
                        <div className="grid grid-cols-2 gap-2">
                          {journey.rca.steps.map((step) => (
                            <span
                              key={step.source}
                              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[14px] text-ink-100"
                            >
                              <IconDb className="h-4 w-4 shrink-0 text-aij-teal" />
                              {step.source}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => go('rca')}
                          className="btn-aij mt-4 flex items-center gap-2 rounded-xl px-6 py-3.5 text-[16px]"
                        >
                          Открыть ход расследования
                          <IconArrow className="h-5 w-5" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-white/8 px-6 py-4">
            {phase === 'idle' ? (
              <div className="flex items-center gap-3">
                <p className="flex-1 rounded-xl border border-aij-teal/40 bg-black/20 px-5 py-4 text-[17px] text-ink-50">
                  {chat.prompt}
                </p>
                <button
                  type="button"
                  onClick={() => setPhase('sent')}
                  className="btn-aij flex items-center gap-2 rounded-xl px-7 py-4 text-[17px]"
                >
                  Отправить
                  <IconArrow className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <p className="px-1 py-2 text-[15px] text-ink-400">Агент сам ходит в источники — аналитику не нужен доступ к трейсам и метрикам.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
