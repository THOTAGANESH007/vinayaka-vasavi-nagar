import { useEffect, useRef, useState } from 'react'
import { HERO_SLIDES } from '../../config/heroSlides'

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #7A2130 0%, #C0611A 100%)',
  'linear-gradient(135deg, #571622 0%, #7A2130 60%, #C89B45 100%)',
  'linear-gradient(135deg, #C0611A 0%, #571622 100%)',
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})
  const touchStartX = useRef<number | null>(null)

  const slides = HERO_SLIDES

  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500)
    return () => clearInterval(timer)
  }, [isPaused, slides.length])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) setIndex((i) => (i - 1 + slides.length) % slides.length)
    else if (delta < -50) setIndex((i) => (i + 1) % slides.length)
    touchStartX.current = null
    setTimeout(() => setIsPaused(false), 3000)
  }

  function goTo(i: number) {
    setIndex(i)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 4000)
  }

  if (slides.length === 0) return null

  return (
    <section className="pt-3 sm:pt-6">
      <div className="container-app">
        <div
          className="relative w-full aspect-video overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, i) => {
            const hasUsableImage = !!slide.imageUrl && !brokenImages[i]
            return (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
              >
                {/* Background image, or festive gradient fallback if no link / link is broken */}
                {hasUsableImage ? (
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onError={() => setBrokenImages((prev) => ({ ...prev, [i]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length] }} />
                )}

                {/* Left-to-right dark gradient so title text stays readable */}
                <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />

                {/* Title — left aligned, short only */}
                <div className="absolute inset-0 flex items-center">
                  <div className="pl-5 sm:pl-10 lg:pl-14 pr-6 max-w-[75%] sm:max-w-[60%]">
                    <p className="text-gold-light text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1.5 sm:mb-2">
                      {slide.eyebrow}
                    </p>
                    <h1 className="font-display text-cream text-xl sm:text-3xl lg:text-4xl leading-tight drop-shadow-md">
                      {slide.title}
                    </h1>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-5 left-5 sm:left-10 flex items-center gap-2 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-cream/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
