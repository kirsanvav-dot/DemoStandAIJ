import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { getDataProvider } from '../../data'
import type { DiffLine } from '../../data/journey'
import { cx } from '../../lib/cx'
import { useDemoStore, type ScreenId } from '../../store/demoStore'
import { IconCheck } from '../Icons'
import { AssistantAvatar, JourneyHeader, Reveal, SectionLabel, useTypewriter } from './Shell'

const BACK_ORDER: ScreenId[] = ['conditions', 'analysis', 'arm']

export function RuleScreen() {
  const caseId = useDemoStore((state) => state.caseId)
  const visited = useDemoStore((state) => state.visited)
  const go = useDemoStore((state) => state.go)
  const setScreen = useDemoStore((state) => state.setScreen)
  const journey = caseId ? getDataProvider().getCase(caseId) : null
  const [applying, setApplying] = useState(false)

  const viaRca = visited.includes('rca')
  const intro = !journey
    ? ''
    : viaRca
      ? 'Первопричину нашли и условия обработки обновили. Осталось поправить правило: оно считало пустой device_id новым устройством. Черновик описания — ниже.'
      : journey.analysis?.kind === 'needs_rca'
        ? 'Первопричину сбоя ещё ищем, но правило можно защитить уже сейчас: пустое поле не должно повышать риск. Черновик описания — ниже.'
        : journey.analysis
          ? 'Данные в порядке — менять нужно логику правила. Подготовил новое описание, проверьте и утвердите.'
          : 'Шаблон знакомый, данные полные. Подготовил правку правила, чтобы такие обращения больше не попадали в очередь.'
  const { shown, done } = useTypewriter(intro, Boolean(journey), 45)

  if (!journey) {
    return <div className="aij-bg flex h-screen items-center justify-center text-ink-300">Кейс не выбран</div>
  }

  const rule = journey.rule
  const basis = rule.basis.filter((item) => !item.needsRca || viaRca)
  const back = BACK_ORDER.find((screen) => visited.includes(screen)) ?? 'arm'

  const approve = () => {
    setApplying(true)
    window.setTimeout(() => go('report'), 1400)
  }

  return (
    <div className="aij-bg flex h-screen flex-col">
      <JourneyHeader
        title="АРМ Аналитика · описание правила"
        subtitle={`${rule.id} «${rule.name}» · по обращению ${journey.eventId}`}
        onBack={() => (back === 'arm' ? setScreen('arm') : go(back))}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-8 py-6">
        <div className="glass flex items-start gap-4 rounded-2xl px-6 py-5">
          <AssistantAvatar size={44} thinking={!done} />
          <p className={cx('min-h-[56px] text-[18px] leading-relaxed text-ink-50', !done && 'typing-caret')}>{shown}</p>
        </div>

        <Reveal delay={0.1} className="grid grid-cols-[1fr_1fr] gap-5">
          <div className="glass rounded-2xl border-bad/25 p-6">
            <SectionLabel>почему сработало неверно</SectionLabel>
            <p className="text-[17px] leading-relaxed text-ink-50">{rule.description.whyWrong}</p>
          </div>
          <div className="glass rounded-2xl border-aij-teal/30 p-6">
            <SectionLabel>что правило проверяет теперь</SectionLabel>
            <ol className="space-y-2">
              {rule.description.checks.map((check, index) => (
                <li key={check} className="flex gap-3 text-[17px] leading-relaxed text-ink-50">
                  <span className="font-mono text-aij-teal">{index + 1}.</span>
                  {check}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <div className="grid min-h-0 grid-cols-[1fr_1fr_0.85fr] gap-5">
          <Reveal delay={0.4} className="glass rounded-2xl p-6">
            <SectionLabel>сейчас</SectionLabel>
            <RuleText lines={rule.current} />
          </Reveal>
          <Reveal delay={0.6} className="glass rounded-2xl border-aij-teal/30 p-6">
            <SectionLabel>предлагает агент</SectionLabel>
            <RuleText lines={rule.proposed} />
          </Reveal>
          <Reveal delay={0.8} className="glass rounded-2xl p-6">
            <SectionLabel>основания</SectionLabel>
            <ul className="space-y-3">
              {basis.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 self-start rounded-md border border-aij-blue/30 bg-aij-blue/10 px-2 py-0.5 font-mono text-[12px] text-aij-blue">
                    {item.label}
                  </span>
                  <span className="text-[16px] leading-relaxed text-ink-100">{item.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={1.1} className="grid grid-cols-[1.6fr_1fr] gap-5">
          <div className="glass rounded-2xl p-6">
            <SectionLabel>ожидаемый эффект</SectionLabel>
            <p className="text-[19px] leading-snug text-ink-50">{rule.effect}</p>
          </div>
          <div className="glass flex items-center gap-5 rounded-2xl p-6">
            <p className="font-mono text-5xl font-medium text-aij-teal">{rule.related}</p>
            <p className="text-[16px] leading-snug text-ink-300">
              связанных обращений закроются вместе с этим кейсом
            </p>
          </div>
        </Reveal>
      </div>

      <div className="glass-strong mx-8 mb-6 flex items-center justify-between gap-6 rounded-2xl px-6 py-5">
        <p className="text-[16px] text-ink-300">Агент готовит правку, утверждает аналитик.</p>
        <AnimatePresence mode="wait">
          {applying ? (
            <motion.p
              key="applying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-xl border border-ok/40 bg-ok/10 px-6 py-4 text-[17px] text-ok"
            >
              <IconCheck className="h-5 w-5" /> Правило активировано · собираем отчёт об эффективности
            </motion.p>
          ) : (
            <motion.div key="actions" className="flex items-center gap-3">
              <button type="button" onClick={() => setScreen('arm')} className="btn-ghost rounded-xl px-6 py-4 text-[16px]">
                Отложить
              </button>
              <button type="button" onClick={approve} className="btn-aij rounded-xl px-7 py-4 text-[17px]">
                Утвердить и активировать
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function RuleText({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="space-y-1.5 font-mono text-[17px] leading-relaxed">
      {lines.map((line) => (
        <p
          key={line.text}
          className={cx(
            'flex rounded-md px-2.5 py-1',
            line.change === 'same' && 'text-ink-100',
            line.change === 'removed' && 'bg-bad/10 text-bad',
            line.change === 'added' && 'bg-ok/10 text-ok',
          )}
        >
          <span className="mr-2 inline-block w-3 shrink-0 text-ink-400">
            {line.change === 'removed' ? '−' : line.change === 'added' ? '+' : ''}
          </span>
          <span
            className={cx(
              line.text.startsWith(' ') && 'pl-6',
              line.change === 'removed' && 'line-through decoration-bad/60',
            )}
          >
            {line.text.trimStart()}
          </span>
        </p>
      ))}
    </div>
  )
}
