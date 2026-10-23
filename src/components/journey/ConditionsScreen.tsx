import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDataProvider } from '../../data'
import { useDemoStore } from '../../store/demoStore'
import { IconArrow, IconCheck } from '../Icons'
import { AssistantAvatar, JourneyHeader, SectionLabel } from './Shell'

export function ConditionsScreen() {
  const caseId = useDemoStore((state) => state.caseId)
  const go = useDemoStore((state) => state.go)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
  const conditions = journey?.conditions ?? null
  const [shown, setShown] = useState(0)
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    if (!conditions) return
    const timers = conditions.changes.map((_, index) =>
      window.setTimeout(() => setShown(index + 1), 500 + index * 700),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [conditions])

  if (!journey || !conditions) {
    return <div className="aij-bg flex h-screen items-center justify-center text-ink-300">Кейс не выбран</div>
  }

  const allShown = shown >= conditions.changes.length

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="Обновление условий"
        subtitle="Агент предлагает изменить обработку события по итогам RCA"
        onBack={() => go('rca')}
        right={
          <div className="flex items-center gap-3">
            <AssistantAvatar size={36} />
            <p className="text-[15px] text-ink-300">черновик изменений готов · нужен ваш апрув</p>
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-8 py-6">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1.25fr_0.6fr_0.9fr_1.4fr] gap-4 border-b border-white/8 px-6 py-3.5 font-mono text-[12px] tracking-wide text-ink-400 uppercase">
            <span>параметр</span>
            <span>было</span>
            <span>станет</span>
            <span>почему</span>
          </div>
          {conditions.changes.map((change, index) => (
            <AnimatePresence key={change.key}>
              {index < shown && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-[1.25fr_0.6fr_0.9fr_1.4fr] items-center gap-4 border-b border-white/5 px-6 py-5 last:border-b-0"
                >
                  <span className="font-mono text-[14px] break-all text-ink-100">{change.key}</span>
                  <span className="font-mono text-[15px] text-bad line-through decoration-bad/60">{change.from}</span>
                  <span className="font-mono text-[15px] font-medium text-aij-teal">{change.to}</span>
                  <span className="text-[15px] leading-relaxed text-ink-300">{change.why}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        <AnimatePresence>
          {allShown && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-5">
              <div className="glass rounded-2xl p-6">
                <SectionLabel>ожидаемый эффект</SectionLabel>
                <p className="text-[20px] leading-snug font-medium text-ink-50">{conditions.forecast}</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <SectionLabel>что дальше</SectionLabel>
                <p className="text-[16px] leading-relaxed text-ink-100">{conditions.note}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {allShown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong mx-8 mb-6 flex items-center justify-between gap-6 rounded-2xl px-6 py-5"
          >
            <p className="text-[16px] text-ink-300">
              {approved ? (
                <span className="flex items-center gap-2 text-ok">
                  <IconCheck className="h-5 w-5" /> Изменения отправлены владельцу модуля на согласование
                </span>
              ) : (
                'Агент не применяет изменения сам — решение за человеком.'
              )}
            </p>
            {approved ? (
              <button
                type="button"
                onClick={() => go('rule')}
                className="btn-aij flex items-center gap-2 rounded-xl px-7 py-4 text-[17px]"
              >
                Поправить правило
                <IconArrow className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setApproved(true)}
                className="btn-aij rounded-xl px-7 py-4 text-[17px]"
              >
                Согласовать изменения
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
