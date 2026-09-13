import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { Countdown } from '../../types'
import { getActiveCountdown } from '../../services/countdown'
import { useCountdown } from '../../hooks/useCountdown'
import { formatEventDate, formatEventTime } from '../../utils/format'

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-xl sm:rounded-2xl px-2 py-2 sm:px-5 sm:py-4 backdrop-blur-sm border border-gold/20 flex-1 min-w-0">
      <span className="font-display text-xl xs:text-2xl sm:text-4xl text-cream tabular-nums drop-shadow-[0_0_12px_rgba(200,155,69,0.5)]">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] sm:text-xs uppercase tracking-widest text-cream/60 mt-0.5 sm:mt-1 whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

export default function CountdownSection() {
  const [countdown, setCountdown] = useState<Countdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getActiveCountdown()
      .then(setCountdown)
      .catch(() => setCountdown(null))
      .finally(() => setIsLoading(false))
  }, [])

  const time = useCountdown(countdown?.event_datetime)

  if (isLoading) {
    return (
      <section className="container-app py-10">
        <div className="skeleton h-48 w-full rounded-3xl" />
      </section>
    )
  }

  if (!countdown) return null

  return (
    <section className="py-10 sm:py-14">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-deep via-maroon to-saffron-dark px-4 py-8 sm:px-10 sm:py-14 text-center shadow-2xl border border-gold/20">
          {/* Ambient glow + subtle pulse for curiosity */}
          <div className="absolute inset-0 bg-diya-glow" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold/20 blur-3xl animate-pulse" />

          <div className="relative">
            {!time.isComplete ? (
              <>
                <div className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/40 text-gold-light text-[11px] sm:text-xs font-semibold uppercase tracking-widest rounded-full px-3.5 py-1.5 mb-4">
                  <Sparkles size={12} className="animate-pulse" /> Something special is coming
                </div>
                <p className="text-cream text-base sm:text-lg font-display mb-1">
                  {countdown.event_name}
                </p>
                <p className="text-cream/70 text-xs sm:text-sm mb-6">
                  {countdown.description_before_event || 'is going to start in'}
                </p>

                <div className="flex items-stretch justify-center gap-1.5 xs:gap-2 sm:gap-4 mb-6 max-w-md mx-auto">
                  <TimeBlock value={time.days} label="Days" />
                  <TimeBlock value={time.hours} label="Hrs" />
                  <TimeBlock value={time.minutes} label="Min" />
                  <TimeBlock value={time.seconds} label="Sec" />
                </div>

                <p className="text-cream/60 text-xs sm:text-sm">
                  {formatEventDate(countdown.event_datetime)} · {formatEventTime(countdown.event_datetime)}
                </p>
              </>
            ) : (
              <div className="animate-fade-up">
                <Sparkles className="mx-auto text-gold-light mb-3" size={32} />
                <h3 className="font-display text-xl sm:text-2xl text-cream mb-2">
                  {countdown.completion_title}
                </h3>
                {countdown.completion_description && (
                  <p className="text-cream/85 text-sm sm:text-base max-w-md mx-auto">
                    {countdown.completion_description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
