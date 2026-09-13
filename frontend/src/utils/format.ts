// This app is single-timezone (Podalakur, India), so every datetime the admin
// enters is treated as IST wall-clock time — never converted through the
// browser's own timezone. This keeps "what the admin typed" and "what
// visitors see" identical no matter where either of them is physically located.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/**
 * Parses a naive ISO datetime string ("2026-09-14T09:00:00", no Z/offset —
 * exactly what the backend returns) as IST wall-clock time and returns the
 * correct absolute Date/epoch for it, regardless of the viewer's device timezone.
 */
export function parseIstNaive(iso: string): Date {
  const [datePart, timePart = '00:00:00'] = iso.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second = 0] = timePart.split(':').map(Number)
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - IST_OFFSET_MS
  return new Date(utcMs)
}

export function formatEventDate(iso: string): string {
  return parseIstNaive(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

export function formatEventTime(iso: string): string {
  return (
    parseIstNaive(iso).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }) + ' IST'
  )
}

export function formatDateTimeShort(iso: string): string {
  return parseIstNaive(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

// Splits a naive "YYYY-MM-DDTHH:mm:ss" ISO string into separate date/time
// values for use with <input type="date"> and <input type="time">.
// Pure string slicing — no Date object, so no timezone can leak in.
export function splitIstIso(iso: string): { date: string; time: string } {
  const [datePart, timePart = '00:00'] = iso.split('T')
  return { date: datePart, time: timePart.slice(0, 5) }
}

// Combines a date input value ("2026-09-14") and time input value ("09:00")
// into the naive ISO string the backend expects, still with no timezone math.
export function combineIstIso(date: string, time: string): string {
  return `${date}T${time || '00:00'}:00`
}
