import { motion } from 'framer-motion'
import { useState } from 'react'

type Point = { t: string; hits: number }

const W = 1760
const H = 300
const PAD = { l: 44, r: 16, t: 26, b: 34 }
const GAP = 2

const INK = '#e2e9f2'
const MUTED = '#6b7d9c'
const GRID = 'rgba(255,255,255,0.07)'
const SERIES = '#4f7cff'

/** Срабатывания правила по часам до и после активации. Одна серия — легенда не нужна. */
export function HitsChart({ data, activatedAt }: { data: Point[]; activatedAt: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const max = Math.max(...data.map((point) => point.hits))
  const yMax = Math.ceil(max / 10) * 10
  const ticks = [0, yMax / 2, yMax]
  const slot = innerW / data.length
  const barW = Math.min(slot * 0.6, 72)
  const x = (index: number) => PAD.l + index * slot + (slot - barW) / 2
  const y = (hits: number) => PAD.t + innerH - (hits / yMax) * innerH
  const activationIndex = data.findIndex((point) => point.t === activatedAt)
  const activationX = activationIndex >= 0 ? PAD.l + activationIndex * slot - GAP / 2 : null
  const hovered = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Срабатывания правила по часам: после активации снизились до обычного уровня">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} stroke={GRID} />
            <text x={PAD.l - 10} y={y(tick) + 4} textAnchor="end" fontSize="12" fill={MUTED} fontFamily="IBM Plex Mono">
              {tick}
            </text>
          </g>
        ))}
        {data.map((point, index) => (
          <text key={point.t} x={x(index) + barW / 2} y={H - 10} textAnchor="middle" fontSize="12" fill={MUTED} fontFamily="IBM Plex Mono">
            {point.t}
          </text>
        ))}

        {activationX !== null && (
          <g>
            <line x1={activationX} x2={activationX} y1={PAD.t - 8} y2={PAD.t + innerH} stroke={INK} strokeOpacity="0.5" strokeDasharray="4 4" />
            <text x={activationX + 8} y={PAD.t + 4} fontSize="13" fill={INK}>
              правило активировано · {activatedAt}
            </text>
          </g>
        )}

        {data.map((point, index) => {
          const top = y(point.hits)
          const height = PAD.t + innerH - top
          return (
            <g key={point.t}>
              <motion.path
                d={barPath(x(index), top, barW, height)}
                fill={SERIES}
                opacity={hover === null || hover === index ? 1 : 0.55}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                style={{ transformOrigin: `0px ${PAD.t + innerH}px`, transformBox: 'view-box' }}
              />
              <rect
                x={PAD.l + index * slot}
                y={PAD.t}
                width={slot}
                height={innerH}
                fill="transparent"
                onPointerEnter={() => setHover(index)}
                onPointerDown={() => setHover(index)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          )
        })}
      </svg>
      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-white/10 bg-[#0b1124] px-3 py-2 font-mono text-[13px] text-ink-50 shadow-lg"
          style={{
            left: `${((x(hover) + barW / 2) / W) * 100}%`,
            top: `${(y(hovered.hits) / H) * 100}%`,
            transform: 'translate(-50%, -130%)',
          }}
        >
          {hovered.t} · {hovered.hits} срабат.
        </div>
      )}
    </div>
  )
}

/** Столбик со скруглённым верхом (4px) и прямым основанием у оси. */
function barPath(left: number, top: number, width: number, height: number): string {
  const r = Math.min(4, width / 2, height)
  const bottom = top + height
  return `M${left} ${bottom} V${top + r} Q${left} ${top} ${left + r} ${top} H${left + width - r} Q${left + width} ${top} ${left + width} ${top + r} V${bottom} Z`
}
