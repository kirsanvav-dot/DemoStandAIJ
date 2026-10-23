import { motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { getDataProvider } from '../../data'
import { cx } from '../../lib/cx'
import { useDemoStore, type ScreenId } from '../../store/demoStore'
import { IconBack, IconCheck } from '../Icons'

const CYCLE: Array<{ id: ScreenId; label: string }> = [
  { id: 'arm', label: 'АРМ Обращений' },
  { id: 'analysis', label: 'Разбор данных' },
  { id: 'chat', label: 'Чат' },
  { id: 'rca', label: 'RCA' },
  { id: 'conditions', label: 'Условия' },
  { id: 'rule', label: 'АРМ Аналитика' },
  { id: 'report', label: 'Отчёт' },
]

/** Где мы в полном цикле: пройденные шаги, текущий, пропущенные. */
export function JourneyBar() {
  const screen = useDemoStore((state) => state.screen)
  const visited = useDemoStore((state) => state.visited)
  const caseId = useDemoStore((state) => state.caseId)
  const currentIndex = CYCLE.findIndex((step) => step.id === screen)

  return (
    <nav aria-label="Этапы цикла" className="flex items-center gap-1.5">
      {CYCLE.map((step, index) => {
        const current = index === currentIndex
        const done = !current && visited.includes(step.id) && index < currentIndex
        const skipped = caseId !== null && !current && !visited.includes(step.id) && index < currentIndex
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <div
              className={cx(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors',
                current && 'border-aij-teal/60 bg-aij-teal/10 text-aij-teal',
                done && 'border-aij-blue/30 bg-aij-blue/10 text-ink-100',
                skipped && 'border-white/5 text-ink-400 line-through decoration-ink-400/60',
                !current && !done && !skipped && 'border-white/8 text-ink-300',
              )}
            >
              {done ? (
                <IconCheck className="h-3.5 w-3.5 text-aij-teal" />
              ) : (
                <span
                  className={cx(
                    'h-1.5 w-1.5 rounded-full',
                    current ? 'bg-aij-teal animate-pulse-soft' : skipped ? 'bg-ink-600' : 'bg-ink-400',
                  )}
                />
              )}
              {step.label}
            </div>
            {index < CYCLE.length - 1 && (
              <div className={cx('h-px w-4', index < currentIndex ? 'bg-aij-blue/50' : 'bg-white/10')} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl">
        <div className="assistant-ring absolute inset-0 rounded-xl opacity-80" />
        <div className="absolute inset-[2px] rounded-[10px] bg-[#070b18]" />
        <span className="relative font-mono text-[11px] font-semibold tracking-wide text-ink-50">AF</span>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-tight text-ink-50">
          SAFCM <span className="aij-text">· Антифрод</span>
        </p>
        <p className="font-mono text-[11px] text-ink-400">AI Journey · демо полного цикла</p>
      </div>
    </div>
  )
}

export function JourneyHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}) {
  const modeLabel = getDataProvider().modeLabel
  return (
    <header className="glass-strong relative z-20 border-x-0 border-t-0">
      <div className="flex items-center justify-between gap-6 px-8 py-4">
        <Brand />
        <JourneyBar />
        <span className="font-mono text-[10px] tracking-wide text-ink-400/70">{modeLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-white/5 px-8 py-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Назад"
              className="btn-ghost flex h-11 w-11 items-center justify-center rounded-xl"
            >
              <IconBack className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-50">{title}</h1>
            {subtitle && <p className="mt-0.5 font-mono text-[13px] text-ink-300">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </header>
  )
}

export function AssistantAvatar({ size = 40, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className={cx('assistant-ring absolute inset-0 rounded-full', thinking && 'animate-spin-slow')} />
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[#081022]">
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="#3fe0c5" strokeWidth="1.8" aria-hidden>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    </div>
  )
}

/** Печатает текст по словам — так выглядит ответ агента. */
export function useTypewriter(text: string, active = true, wordMs = 55): { shown: string; done: boolean } {
  const [count, setCount] = useState(0)
  const words = text.split(/(\s+)/)

  useEffect(() => {
    setCount(0)
    if (!active) return
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setCount(index)
      if (index >= words.length) window.clearInterval(timer)
    }, wordMs)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active, wordMs])

  return { shown: words.slice(0, count).join(''), done: count >= words.length }
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-mono text-[12px] tracking-[0.12em] text-ink-400 uppercase">{children}</p>
}
