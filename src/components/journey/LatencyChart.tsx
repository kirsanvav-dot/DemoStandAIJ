import { motion } from 'framer-motion'
import { useState } from 'react'

type Point = { t: string; ms: number }

const W = 600
const H = 270
const PAD = { l: 56, r: 20, t: 22, b: 34 }
const Y_MAX = 2000
const Y_TICKS = [0, 500, 1000, 1500, 2000]

const INK = '#e2e9f2'
const MUTED = '#6b7d9c'
const GRID = 'rgba(255,255,255,0.07)'
const SERIES = '#4f7cff'
const CRITICAL = '#f87171'

/** p99 задержки модуля во времени против таймаута оркестратора. Одна серия — легенда не нужна. */
export function LatencyChart({ data, timeoutMs, releaseAfter }: { data: Point[]; timeoutMs: number; releaseAfter: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const x = (index: number) => PAD.l + (index / (data.length - 1)) * innerW
  const y = (ms: number) => PAD.t + innerH - (ms / Y_MAX) * innerH
  const path = data.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(point.ms)}`).join(' ')
  const releaseIndex = data.findIndex((point) => point.t === releaseAfter)
  const releaseX = releaseIndex >= 0 ? (x(releaseIndex) + x(releaseIndex + 1)) / 2 : null
  const hovered = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Задержка fingerprint-service (p99) превысила таймаут оркестратора после релиза">
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} stroke={GRID} />
            <text x={PAD.l - 10} y={y(tick) + 4} textAnchor="end" fontSize="12" fill={MUTED} fontFamily="IBM Plex Mono">
              {tick === 0 ? '0' : `${tick / 1000}с`}
            </text>
          </g>
        ))}
        {data.map((point, index) =>
          index % 2 === 0 ? (
            <text key={point.t} x={x(index)} y={H - 10} textAnchor="middle" fontSize="12" fill={MUTED} fontFamily="IBM Plex Mono">
              {point.t}
            </text>
          ) : null,
        )}

        <rect x={PAD.l} y={PAD.t} width={innerW} height={y(timeoutMs) - PAD.t} fill={CRITICAL} opacity="0.06" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(timeoutMs)} y2={y(timeoutMs)} stroke={CRITICAL} strokeWidth="2" strokeDasharray="6 5" />
        <text x={PAD.l + 8} y={y(timeoutMs) - 8} fontSize="13" fill={INK}>
          таймаут оркестратора · {timeoutMs} мс
        </text>

        {releaseX !== null && (
          <g>
            <line x1={releaseX} x2={releaseX} y1={PAD.t} y2={PAD.t + innerH} stroke={MUTED} strokeDasharray="3 4" />
            <text x={releaseX + 8} y={PAD.t + innerH - 10} fontSize="13" fill={INK}>
              релиз v3.12
            </text>
          </g>
        )}

        <motion.path
          d={path}
          fill="none"
          stroke={SERIES}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        {data.map((point, index) => (
          <g key={point.t}>
            <circle
              cx={x(index)}
              cy={y(point.ms)}
              r={hover === index ? 6 : 4}
              fill={SERIES}
              stroke="#0b1124"
              strokeWidth="2"
            />
            <rect
              x={x(index) - innerW / data.length / 2}
              y={PAD.t}
              width={innerW / data.length}
              height={innerH}
              fill="transparent"
              onPointerEnter={() => setHover(index)}
              onPointerDown={() => setHover(index)}
              onPointerLeave={() => setHover(null)}
            />
          </g>
        ))}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + innerH} stroke="rgba(255,255,255,0.25)" />
        )}
      </svg>
      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-white/10 bg-[#0b1124] px-3 py-2 font-mono text-[13px] text-ink-50 shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(hovered.ms) / H) * 100}%`, transform: 'translate(-50%, -130%)' }}
        >
          {hovered.t} · {hovered.ms.toLocaleString('ru-RU')} мс
        </div>
      )}
    </div>
  )
}
