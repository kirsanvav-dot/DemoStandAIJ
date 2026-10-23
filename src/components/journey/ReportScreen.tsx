import { motion } from 'framer-motion'
import { getDataProvider } from '../../data'
import { cx } from '../../lib/cx'
import { useDemoStore } from '../../store/demoStore'
import { IconArrow } from '../Icons'
import { HitsChart } from './HitsChart'
import { AssistantAvatar, JourneyHeader, Reveal, SectionLabel, useTypewriter } from './Shell'

/** Отчёт об эффективности правила после активации — последний шаг цикла перед возвратом в очередь. */
export function ReportScreen() {
  const caseId = useDemoStore((state) => state.caseId)
  const closeCase = useDemoStore((state) => state.closeCase)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
  const { shown, done } = useTypewriter(journey?.report.conclusion ?? '', Boolean(journey), 45)

  if (!journey) {
    return <div className="aij-bg flex h-screen items-center justify-center text-ink-300">Кейс не выбран</div>
  }

  const { rule, report } = journey
  const close = () => closeCase({ caseId: journey.id, related: rule.related, ruleId: rule.id })

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="АРМ Аналитика · эффективность правила"
        subtitle={`${rule.id} «${rule.name}» · ${report.period}`}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-8 py-6 *:shrink-0">
        <div className="glass flex items-start gap-4 rounded-2xl px-6 py-5">
          <AssistantAvatar size={44} thinking={!done} />
          <p className={cx('min-h-[56px] text-[18px] leading-relaxed text-ink-50', !done && 'typing-caret')}>{shown}</p>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${report.metrics.length}, minmax(0, 1fr))` }}>
          {report.metrics.map((metric, index) => (
            <Reveal key={metric.label} delay={0.2 + index * 0.12} className="glass rounded-2xl p-5">
              <p className="min-h-[44px] text-[15px] leading-snug text-ink-300">{metric.label}</p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono text-2xl text-ink-400 line-through decoration-ink-400/60">{metric.before}</span>
                <IconArrow className="h-5 w-5 shrink-0 self-center text-ink-400" />
                <span className="font-mono text-4xl font-medium text-ink-50">{metric.after}</span>
              </div>
              {metric.note && <p className="mt-2 text-[14px] text-aij-teal">{metric.note}</p>}
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.7} className="glass rounded-2xl p-6">
          <SectionLabel>срабатывания правила по часам</SectionLabel>
          <HitsChart data={report.hourly} activatedAt={report.activatedAt} />
        </Reveal>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="glass-strong mx-8 mb-6 flex items-center justify-between gap-6 rounded-2xl px-6 py-5"
      >
        <p className="text-[16px] text-ink-300">
          Вместе с кейсом закроются <span className="font-semibold text-ink-50">{rule.related}</span> связанных
          обращений.
        </p>
        <button type="button" onClick={close} className="btn-aij flex items-center gap-2 rounded-xl px-7 py-4 text-[17px]">
          Закрыть кейс и вернуться в АРМ Обращений
          <IconArrow className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  )
}
