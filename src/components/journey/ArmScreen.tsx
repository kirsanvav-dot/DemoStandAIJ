import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { getDataProvider } from '../../data'
import { QUEUE_TOTAL, type CaseRow, type JourneyCase } from '../../data/journey'
import { cx } from '../../lib/cx'
import { useDemoStore, type ClosedCase } from '../../store/demoStore'
import { IconArrow, IconCheck } from '../Icons'
import { AssistantAvatar, JourneyHeader, SectionLabel, useTypewriter } from './Shell'

const STATUS_LABEL: Record<CaseRow['status'], string> = {
  new: 'Новое',
  review: 'На проверке',
  closed: 'Закрыто',
}

export function ArmScreen() {
  const provider = getDataProvider()
  const rows = provider.getCaseQueue()
  const closed = useDemoStore((state) => state.closed)
  const lastClosed = useDemoStore((state) => state.lastClosed)
  const dismissToast = useDemoStore((state) => state.dismissToast)
  const setScreen = useDemoStore((state) => state.setScreen)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const closedRelated = closed.reduce((sum, item) => sum + item.related, 0)
  const flaggedLeft = rows.filter((row) => row.caseId && !closed.some((item) => item.caseId === row.caseId)).length

  useEffect(() => {
    if (!lastClosed) return
    const timer = window.setTimeout(dismissToast, 7000)
    return () => window.clearTimeout(timer)
  }, [lastClosed, dismissToast])

  const selectedRow = rows.find((row) => row.eventId === selectedId) ?? null

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="АРМ Обращений"
        subtitle="Очередь обращений по сработавшим правилам · учебные данные"
        onBack={() => setScreen('pipeline')}
        right={
          <div className="flex items-center gap-8">
            <Stat label="в очереди" value={String(QUEUE_TOTAL - closedRelated)} />
            <Stat label="закрыто с агентом" value={String(closedRelated)} accent />
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 gap-6 px-8 py-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <AnimatePresence mode="wait">
            {lastClosed ? (
              <ClosedToast key={`toast-${lastClosed.caseId}`} closed={lastClosed} />
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass flex items-center gap-4 rounded-2xl px-5 py-4"
              >
                <AssistantAvatar size={36} />
                <p className="text-[16px] text-ink-100">
                  {flaggedLeft > 0 ? (
                    <>
                      Агент отметил <span className="font-semibold text-aij-teal">{flaggedLeft}</span>{' '}
                      {flaggedLeft === 1 ? 'обращение' : 'обращения'}, где проблема не в клиенте, а в данных или
                      правиле. Выберите любое.
                    </>
                  ) : (
                    'Все отмеченные агентом обращения разобраны. Очередь стала короче — можно начать заново.'
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass min-h-0 flex-1 overflow-auto rounded-2xl">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#0b1124]/95">
                <tr className="font-mono text-[12px] tracking-wide text-ink-400 uppercase">
                  <th className="px-5 py-3.5 font-medium">Событие</th>
                  <th className="px-4 py-3.5 font-medium">Клиент / ИНН</th>
                  {!selectedRow && <th className="px-4 py-3.5 font-medium">Получатель</th>}
                  <th className="px-4 py-3.5 font-medium">Сумма</th>
                  <th className="px-4 py-3.5 font-medium">Правило</th>
                  {!selectedRow && <th className="px-4 py-3.5 font-medium">Канал</th>}
                  <th className="px-4 py-3.5 font-medium">Статус</th>
                  <th className="px-5 py-3.5 font-medium">Агент</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isClosed = closed.some((item) => item.caseId === row.caseId)
                  const status = isClosed ? 'closed' : row.status
                  const active = row.eventId === selectedId
                  return (
                    <tr
                      key={row.eventId}
                      onClick={() => setSelectedId(row.eventId)}
                      className={cx(
                        'cursor-pointer border-t border-white/5 text-[15px] transition-colors',
                        active ? 'bg-aij-blue/12' : 'hover:bg-white/[0.03]',
                        isClosed && !active && 'opacity-55',
                      )}
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-ink-100">{row.time}</p>
                        <p className="font-mono text-[12px] text-ink-400">{row.eventId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-ink-50">{row.client}</p>
                        <p className="font-mono text-[12px] text-ink-400">{row.inn}</p>
                      </td>
                      {!selectedRow && (
                        <td className="px-4 py-4">
                          <p className="text-ink-100">{row.counterparty}</p>
                          <p className="text-[12px] text-ink-400">{row.counterpartyNote}</p>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <p className="font-mono whitespace-nowrap text-ink-50">{row.amount}</p>
                        <p className="text-[12px] text-ink-400">{row.operation}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-[13px] text-aij-blue">{row.rule}</p>
                        <p className="text-[12px] text-ink-300">{row.ruleName}</p>
                      </td>
                      {!selectedRow && (
                        <td className="px-4 py-4">
                          <p className="text-ink-100">{row.channel}</p>
                          <p className="text-[12px] text-ink-400">{row.city}</p>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-4">
                        {row.flag && !isClosed ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-aij-teal/40 bg-aij-teal/10 px-3 py-1 text-[13px] whitespace-nowrap text-aij-teal">
                            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-aij-teal" />
                            {row.flag}
                          </span>
                        ) : isClosed ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-ok">
                            <IconCheck className="h-4 w-4" /> разобрано
                          </span>
                        ) : (
                          <span className="text-[13px] text-ink-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="border-t border-white/5 px-5 py-3 font-mono text-[12px] text-ink-400">
              показано {rows.length} из {QUEUE_TOTAL - closedRelated} · данные вымышлены
            </p>
          </div>
        </div>

        <AnimatePresence>
          {selectedRow && (
            <motion.aside
              key="panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="glass-strong flex w-[600px] shrink-0 flex-col overflow-hidden rounded-2xl"
            >
              <CasePanel
                key={selectedRow.eventId}
                row={selectedRow}
                closedCase={closed.find((item) => item.caseId === selectedRow.caseId) ?? null}
                onClose={() => setSelectedId(null)}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <motion.p
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cx('font-mono text-2xl font-medium', accent ? 'text-aij-teal' : 'text-ink-50')}
      >
        {value}
      </motion.p>
      <p className="text-[12px] text-ink-400">{label}</p>
    </div>
  )
}

function StatusPill({ status }: { status: CaseRow['status'] }) {
  return (
    <span
      className={cx(
        'inline-block rounded-md border px-2.5 py-1 text-[13px] whitespace-nowrap',
        status === 'new' && 'border-aij-blue/30 bg-aij-blue/10 text-ink-100',
        status === 'review' && 'border-warn/30 bg-warn/10 text-warn',
        status === 'closed' && 'border-ok/30 bg-ok/10 text-ok',
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function ClosedToast({ closed }: { closed: ClosedCase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-4 rounded-2xl border border-ok/30 bg-ok/10 px-5 py-4"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ok/20">
        <IconCheck className="h-5 w-5 text-ok" />
      </div>
      <p className="text-[16px] text-ink-50">
        Правило <span className="font-mono text-ok">{closed.ruleId}</span> обновлено. Кейс закрыт, вместе с ним
        закрыто <span className="font-semibold text-ok">{closed.related}</span> связанных обращений — очередь стала
        короче.
      </p>
    </motion.div>
  )
}

function CasePanel({
  row,
  closedCase,
  onClose,
}: {
  row: CaseRow
  closedCase: ClosedCase | null
  onClose: () => void
}) {
  const provider = getDataProvider()
  const journey = useMemo(() => (row.caseId ? provider.getCase(row.caseId) : null), [provider, row.caseId])

  return (
    <>
      <div className="border-b border-white/8 px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[13px] text-ink-400">
            Обращение {row.eventId} · {row.time}
          </p>
          <button type="button" onClick={onClose} className="btn-ghost rounded-lg px-3 py-1.5 text-[13px]">
            закрыть
          </button>
        </div>
        <p className="text-xl font-semibold text-ink-50">{row.client}</p>
        <p className="mt-1 text-[15px] text-ink-300">
          {row.operation.split(' · ')[0]} {row.amount} → {row.counterparty}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-aij-blue/30 bg-aij-blue/10 px-3 py-1.5">
          <span className="text-[12px] text-ink-300">сработало</span>
          <span className="font-mono text-[13px] text-aij-blue">{row.rule}</span>
          <span className="text-[13px] text-ink-100">«{row.ruleName}»</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {closedCase ? (
          <ClosedSummary closedCase={closedCase} />
        ) : journey ? (
          <AssistantBlock journey={journey} />
        ) : (
          <QuietAssistant />
        )}
      </div>
    </>
  )
}

function AssistantBlock({ journey }: { journey: JourneyCase }) {
  const openCase = useDemoStore((state) => state.openCase)
  const go = useDemoStore((state) => state.go)
  const [thinking, setThinking] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setThinking(false), 1100)
    return () => window.clearTimeout(timer)
  }, [])

  const { shown, done } = useTypewriter(journey.assistant.summary, !thinking)

  const start = () => {
    openCase(journey.id, journey.scenarioId)
    go(journey.assistant.action === 'defect' ? 'analysis' : 'rule')
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <AssistantAvatar size={44} thinking={thinking} />
        <div>
          <p className="text-[16px] font-semibold text-ink-50">Агент-ассистент</p>
          <p className="font-mono text-[12px] text-ink-400">
            {thinking ? 'смотрит событие, правило и историю клиента…' : 'разбор обращения'}
          </p>
        </div>
      </div>

      <p className={cx('min-h-[120px] text-[17px] leading-relaxed text-ink-50', !done && !thinking && 'typing-caret')}>
        {shown}
      </p>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <SectionLabel>на что опирается</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {journey.assistant.facts.map((fact, index) => (
                <motion.span
                  key={fact}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[13px] text-ink-100"
                >
                  {fact}
                </motion.span>
              ))}
            </div>

            <div className="mt-7 rounded-xl border border-aij-teal/25 bg-aij-teal/[0.06] p-4">
              <p className="mb-3 text-[14px] text-ink-300">
                Рекомендация агента:{' '}
                <span className="text-ink-50">
                  {journey.assistant.action === 'defect'
                    ? 'сначала разобрать дефект данных'
                    : 'данные полные — сразу поправить правило'}
                </span>
              </p>
              <button
                type="button"
                onClick={start}
                className="btn-aij flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[17px]"
              >
                {journey.assistant.recommendation}
                <IconArrow className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuietAssistant() {
  const { shown, done } = useTypewriter(
    'Атрибуты события пришли полностью, правило сработало штатно. Аномалий в данных не вижу — решение по обращению остаётся за аналитиком.',
  )
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <AssistantAvatar size={44} />
        <p className="text-[16px] font-semibold text-ink-50">Агент-ассистент</p>
      </div>
      <p className={cx('text-[17px] leading-relaxed text-ink-100', !done && 'typing-caret')}>{shown}</p>
    </div>
  )
}

function ClosedSummary({ closedCase }: { closedCase: ClosedCase }) {
  return (
    <div className="rounded-xl border border-ok/30 bg-ok/10 p-5">
      <p className="mb-2 flex items-center gap-2 text-[17px] font-semibold text-ok">
        <IconCheck className="h-5 w-5" /> Обращение разобрано
      </p>
      <p className="text-[16px] leading-relaxed text-ink-100">
        Правило <span className="font-mono">{closedCase.ruleId}</span> обновлено. Вместе с этим обращением закрыто{' '}
        {closedCase.related} связанных.
      </p>
    </div>
  )
}
