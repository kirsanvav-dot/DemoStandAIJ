import { useEffect, useState } from 'react'

/** Возвращает секунды до срабатывания. Любое нажатие начинает отсчёт заново. */
export function useIdleReset(active: boolean, seconds: number, onFire: () => void): number {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (!active) return
    let remaining = seconds
    setLeft(seconds)

    const reset = () => {
      remaining = seconds
      setLeft(seconds)
    }

    const timer = window.setInterval(() => {
      remaining -= 1
      setLeft(remaining)
      if (remaining <= 0) onFire()
    }, 1000)

    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [active, seconds, onFire])

  return left
}
