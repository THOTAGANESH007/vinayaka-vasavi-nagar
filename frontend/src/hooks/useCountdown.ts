import { useEffect, useState } from 'react'
import { parseIstNaive } from '../utils/format'

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
}

export function useCountdown(targetIso: string | null | undefined): TimeRemaining {
  const [remaining, setRemaining] = useState<TimeRemaining>(() => calculate(targetIso))

  useEffect(() => {
    if (!targetIso) return
    const interval = setInterval(() => {
      setRemaining(calculate(targetIso))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetIso])

  return remaining
}

function calculate(targetIso: string | null | undefined): TimeRemaining {
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true }

  const target = parseIstNaive(targetIso).getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, isComplete: false }
}
