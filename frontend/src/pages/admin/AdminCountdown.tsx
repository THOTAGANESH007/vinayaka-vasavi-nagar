import { useEffect, useState, type FormEvent } from 'react'
import { Timer, Save, AlertCircle, CalendarDays, Clock } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import { getActiveCountdown, createCountdown, type CountdownPayload } from '../../services/countdown'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../services/api'
import { splitIstIso, combineIstIso } from '../../utils/format'

interface FormState {
  event_name: string
  event_date: string
  event_time: string
  description_before_event: string
  completion_title: string
  completion_description: string
}

const EMPTY: FormState = {
  event_name: '',
  event_date: '',
  event_time: '',
  description_before_event: 'is going to start in',
  completion_title: '',
  completion_description: '',
}

export default function AdminCountdown() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasActive, setHasActive] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    getActiveCountdown()
      .then((c) => {
        if (c) {
          setHasActive(true)
          const { date, time } = splitIstIso(c.event_datetime)
          setForm({
            event_name: c.event_name,
            event_date: date,
            event_time: time,
            description_before_event: c.description_before_event || 'is going to start in',
            completion_title: c.completion_title,
            completion_description: c.completion_description || '',
          })
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.event_name.trim()) next.event_name = 'Event name is required'
    if (!form.event_date) next.event_date = 'Date is required'
    if (!form.event_time) next.event_time = 'Time is required'
    if (!form.completion_title.trim()) next.completion_title = 'Completion message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const payload: CountdownPayload = {
        event_name: form.event_name,
        event_datetime: combineIstIso(form.event_date, form.event_time),
        description_before_event: form.description_before_event,
        completion_title: form.completion_title,
        completion_description: form.completion_description,
      }
      await createCountdown(payload)
      setHasActive(true)
      showToast('Countdown updated — this is now the only active countdown.')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save the countdown.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-96 w-full max-w-xl mx-auto" />
      </div>
    )
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <AdminPageHeader icon={Timer} title="Countdown" subtitle="Only one countdown can be active at a time" />

      <div className="max-w-xl">
        {hasActive && (
          <div className="flex items-start gap-2.5 bg-saffron/10 border border-saffron/30 rounded-xl px-4 py-3 mb-5 text-sm text-ink/70">
            <AlertCircle size={16} className="text-saffron-dark flex-shrink-0 mt-0.5" />
            <span>Saving below will replace the currently active countdown. Visitors will immediately see the new one.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Event Name</label>
            <input
              className="input-field"
              placeholder="Ganesh Chaturthi Maha Pooja"
              value={form.event_name}
              onChange={(e) => setForm({ ...form, event_name: e.target.value })}
            />
            {errors.event_name && <p className="text-red-600 text-xs mt-1">{errors.event_name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink/70">Event Date & Time</label>
              <span className="text-[11px] font-semibold text-saffron-dark bg-saffron/10 rounded-full px-2 py-0.5">
                IST (Asia/Kolkata)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maroon/40 pointer-events-none" />
                <input
                  type="date"
                  className="input-field !pl-10"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </div>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maroon/40 pointer-events-none" />
                <input
                  type="time"
                  className="input-field !pl-10"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                />
              </div>
            </div>
            {(errors.event_date || errors.event_time) && (
              <p className="text-red-600 text-xs mt-1">{errors.event_date || errors.event_time}</p>
            )}
            <p className="text-ink/40 text-xs mt-1.5">
              Enter the time as it will happen locally in Podalakur — no conversion needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Text before the countdown numbers</label>
            <input
              className="input-field"
              placeholder="is going to start in"
              value={form.description_before_event}
              onChange={(e) => setForm({ ...form, description_before_event: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-maroon/10 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">Completion Title</label>
              <input
                className="input-field"
                placeholder="Ganesh Chaturthi Maha Pooja has started!"
                value={form.completion_title}
                onChange={(e) => setForm({ ...form, completion_title: e.target.value })}
              />
              {errors.completion_title && <p className="text-red-600 text-xs mt-1">{errors.completion_title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">Completion Message</label>
              <textarea
                className="input-field min-h-[90px] resize-none"
                placeholder="All are welcome to participate and celebrate this auspicious occasion with us."
                value={form.completion_description}
                onChange={(e) => setForm({ ...form, completion_description: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <Save size={16} /> {isSubmitting ? 'Saving…' : 'Save Countdown'}
          </button>
        </form>
      </div>
    </div>
  )
}
