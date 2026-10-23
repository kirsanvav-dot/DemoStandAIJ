import { AnimatePresence, motion } from 'framer-motion'
import type { PipelineEvent } from '../data'

const OPERATIONS = [
  'Перевод · 12 400 ₽',
  'Оплата · 3 250 ₽',
  'СБП · 48 000 ₽',
  'Перевод · 1 250 000 ₽',
  'Оплата · 785 ₽',
  'Снятие · 20 000 ₽',
  'Перевод · 96 300 ₽',
  'Оплата · 14 990 ₽',
]

type Mood = 'sneak' | 'caught' | 'grin'

function moodOf(run: PipelineEvent): Mood {
  if (run.type === 'clean' && run.phase === 'done') return 'caught'
  if (run.type === 'dirty' && run.phase === 'alerting') return 'grin'
  return 'sneak'
}

const BUBBLE: Record<Mood, string | null> = {
  sneak: null,
  caught: 'Опять поймали…',
  grin: 'Данные потерялись — проскочу?',
}

/** Конвейер операций и маскот-фрод: пробирается по стадиям, на чистом прогоне его ловят. */
export function FraudConveyor({ run, stageCount }: { run: PipelineEvent; stageCount: number }) {
  const mood = moodOf(run)
  const position = run.activeStage < 0 ? -0.06 : (run.activeStage + 0.5) / stageCount
  const bubble = BUBBLE[mood]

  return (
    <div className="relative w-full max-w-[1400px]">
      <div className="relative h-28">
        <motion.div
          className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
          initial={false}
          animate={{ left: `${position * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <AnimatePresence>
            {bubble && (
              <motion.p
                key={`${mood}-${run.cycle}`}
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-1 rounded-xl border border-white/10 bg-ink-850 px-3 py-1.5 text-[13px] whitespace-nowrap text-ink-50"
              >
                {bubble}
              </motion.p>
            )}
          </AnimatePresence>
          <FraudMascot mood={mood} />
        </motion.div>
      </div>
      <div className="relative h-11 overflow-hidden rounded-xl border border-ink-600/40 bg-ink-850/70">
        <div className="animate-belt flex w-max gap-3 py-2">
          {[...OPERATIONS, ...OPERATIONS].map((operation, index) => (
            <span
              key={index}
              className="rounded-md border border-ink-600/40 bg-ink-800 px-3 py-1 font-mono text-[12px] whitespace-nowrap text-ink-200"
            >
              {operation}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Маскот-фрод: фиолетовый «колобок» в маске грабителя. */
function FraudMascot({ mood }: { mood: Mood }) {
  return (
    <motion.svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      aria-label={mood === 'caught' ? 'Фрод пойман' : 'Фрод пробирается по конвейеру'}
      role="img"
      animate={mood === 'sneak' ? { y: [0, -5, 0] } : mood === 'grin' ? { rotate: [0, -6, 6, 0] } : { y: 0 }}
      transition={{ duration: mood === 'sneak' ? 0.5 : 0.8, repeat: mood === 'caught' ? 0 : Infinity }}
    >
      <ellipse cx="36" cy="68" rx="18" ry="3" fill="#000" opacity="0.35" />
      <path d="M26 60 l-3 6 M46 60 l3 6" stroke="#8a6bff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="38" r="24" fill="#8a6bff" />
      <circle cx="36" cy="38" r="24" fill="url(#mascot-shine)" />
      <rect x="13" y="27" width="46" height="13" rx="6.5" fill="#05070f" />
      <circle cx="27" cy="33.5" r="3.2" fill="#e2e9f2" />
      <circle cx="45" cy="33.5" r="3.2" fill="#e2e9f2" />
      {mood === 'caught' ? (
        <path d="M28 52 q8 -6 16 0" stroke="#05070f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M27 48 q9 8 18 0" stroke="#05070f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {mood === 'caught' && (
        <g stroke="#3fe0c5" strokeWidth="1.6" opacity="0.9">
          <circle cx="36" cy="38" r="28" fill="rgba(63,224,197,0.08)" />
          <path d="M12 26 L60 50 M12 50 L60 26 M36 10 V66 M8 38 H64" />
        </g>
      )}
      <defs>
        <radialGradient id="mascot-shine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  )
}
