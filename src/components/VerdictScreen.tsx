import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { RiskLevel, VerdictStatus } from '../data/scenarios'
import { cx } from '../lib/cx'
import { useDemoStore } from '../store/demoStore'
import { IconAlert, IconBack, IconCheck, IconChevron, IconClock, IconFlag, IconHistory } from './Icons'

const STATUS: Record<
  VerdictStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof IconAlert }
> = {
  confirmed: {
    label: 'Подтверждённо отсутствует',
    color: 'text-bad',
    bg: 'bg-bad/10',
    border: 'border-bad/40',
    icon: IconAlert,
  },
  recovered: {
    label: 'Восстановлен из истории',
    color: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/40',
    icon: IconCheck,
  },
  unavailable: {
    label: 'Недоступен для расчёта',
    color: 'text-ink-300',
    bg: 'bg-ink-700/30',
    border: 'border-ink-600/40',
    icon: IconHistory,
  },
}

const RISK: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'Высокий', color: 'text-bad', bg: 'bg-bad/10', border: 'border-bad/40' },
  medium: { label: 'Средний', color: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/40' },
  low: { label: 'Низкий', color: 'text-ok', bg: 'bg-ok/10', border: 'border-ok/40' },
}

const IDLE_SEC = 18

export function VerdictScreen() {
  const selected = useDemoStore((state) => state.selected)
  const setScreen = useDemoStore((state) => state.setScreen)
  const reset = useDemoStore((state) => state.reset)
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(IDLE_SEC)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          reset()
          return IDLE_SEC
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [reset])

  if (!selected) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-300">Сценарий не выбран</div>
    )
  }

  const status = STATUS[selected.verdict.status]
  const risk = RISK[selected.verdict.riskLevel]
  const StatusIcon = status.icon

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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
            <IconFlag className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-50">Вердикт</h1>
            <p className="font-mono text-xs text-ink-300">{selected.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-ink-300">
          <IconClock className="h-3.5 w-3.5" />
          <span>автовозврат через</span>
          <span className="tabular-nums text-accent">{left}с</span>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="mx-auto max-w-[900px]">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-ink-600/40 bg-ink-850/60"
          >
            <div className={cx('border-b px-6 py-5', status.border, status.bg)}>
              <div className="flex items-center gap-4">
                <div className={cx('flex h-14 w-14 items-center justify-center rounded-xl border', status.bg, status.border)}>
                  <StatusIcon className={cx('h-7 w-7', status.color)} />
                </div>
                <div>
                  <p className={cx('mb-1 font-mono text-xs', status.color)}>Статус атрибута</p>
                  <h2 className="text-xl font-semibold text-ink-50">{status.label}</h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="mb-2 font-mono text-xs text-ink-400">Причина</p>
              <p className="text-lg leading-relaxed text-ink-100">{selected.verdict.reason}</p>
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="mt-4 flex min-h-11 items-center gap-1.5 font-mono text-xs text-accent/70 transition-colors hover:text-accent"
              >
                <IconChevron className="h-3.5 w-3.5" down={open} />
                {open ? 'скрыть техническую деталь' : 'показать техническую деталь'}
              </button>
              <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
                <code className="mt-3 block rounded-lg border border-ink-700/40 bg-ink-900/60 p-4 font-mono text-xs leading-relaxed text-ink-300">
                  {selected.verdict.technicalDetail}
                </code>
              </motion.div>
            </div>

            <div className="border-t border-ink-700/40 bg-ink-900/30 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                  <IconFlag className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="mb-1 font-mono text-xs text-ink-400">Рекомендуемое действие</p>
                  <p className="text-sm text-ink-100">{selected.verdict.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-ink-700/40 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bad/30 bg-bad/10">
                  <IconAlert className="h-4 w-4 text-bad" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <p className="font-mono text-xs text-ink-400">Влияние на скоринг</p>
                    <span className={cx('rounded border px-2 py-0.5 font-mono text-[10px] font-semibold', risk.color, risk.bg, risk.border)}>
                      риск: {risk.label.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-100">{selected.verdict.scoringImpact}</p>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setScreen('alerts')}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-ink-600/40 bg-ink-800 px-6 py-3 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700"
            >
              <IconBack className="h-4 w-4" />
              Назад к алертам
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
