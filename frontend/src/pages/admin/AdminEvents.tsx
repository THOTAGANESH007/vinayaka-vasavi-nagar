import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, Plus, Pencil, Trash2, X, Clock } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import type { FestivalEvent } from '../../types'
import { getAllEvents, createEvent, updateEvent, deleteEvent, type EventPayload } from '../../services/events'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../services/api'
import { formatEventDate, formatEventTime, splitIstIso, combineIstIso } from '../../utils/format'

interface FormState {
  title: string
  description: string
  event_date: string
  event_time: string
}

const EMPTY: FormState = { title: '', description: '', event_date: '', event_time: '' }

export default function AdminEvents() {
  const [events, setEvents] = useState<FestivalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<FestivalEvent | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FestivalEvent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()

  function load() {
    setIsLoading(true)
    getAllEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setIsModalOpen(true)
  }

  function openEdit(event: FestivalEvent) {
    setEditing(event)
    const { date, time } = splitIstIso(event.event_datetime)
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: date,
      event_time: time,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.event_date) next.event_date = 'Date is required'
    if (!form.event_time) next.event_time = 'Time is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const payload: EventPayload = {
        title: form.title,
        description: form.description,
        event_datetime: combineIstIso(form.event_date, form.event_time),
      }
      if (editing) {
        await updateEvent(editing.id, payload)
        showToast('Event updated')
      } else {
        await createEvent(payload)
        showToast('Event added')
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save the event.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteEvent(deleteTarget.id)
      showToast('Event deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete the event.'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <AdminPageHeader
        icon={CalendarDays}
        title="Events"
        subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} total`}
        action={
          <button onClick={openCreate} className="btn-primary !px-4 !py-2.5 !text-sm">
            <Plus size={16} /> Add Event
          </button>
        }
      />

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : events.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            message="Add your first event so members can see what's coming up."
            action={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Event</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="card-surface p-5 flex flex-col">
              <p className="text-saffron-dark text-xs font-semibold mb-1.5">
                {formatEventDate(event.event_datetime)} · {formatEventTime(event.event_datetime)}
              </p>
              <h3 className="font-display text-lg text-ink mb-1.5">{event.title}</h3>
              {event.description && <p className="text-ink/60 text-sm mb-4 flex-1">{event.description}</p>}
              <div className="flex gap-2 mt-auto pt-3 border-t border-maroon/5">
                <button onClick={() => openEdit(event)} className="btn-secondary flex-1 !py-2 !text-xs">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(event)} className="btn-danger flex-1 !py-2 !text-xs">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Event' : 'Add Event'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Event Title</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ganpati Sthapana"
            />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Description</label>
            <textarea
              className="input-field min-h-[90px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Idol installation ceremony with traditional rituals"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink/70">Date & Time</label>
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
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              <X size={16} /> Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
