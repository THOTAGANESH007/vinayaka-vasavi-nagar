import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Users, Plus, Pencil, Trash2, X, Camera } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ImageWithFallback from '../../components/ui/ImageWithFallback'
import type { Coordinator } from '../../types'
import { getCoordinators, createCoordinator, updateCoordinator, deleteCoordinator, type CoordinatorPayload } from '../../services/coordinators'
import { mediaAssetUrl, getApiErrorMessage } from '../../services/api'
import { useToast } from '../../context/ToastContext'

interface FormState {
  name: string
  designation: string
  display_order: number
  image: File | null
}

const EMPTY: FormState = { name: '', designation: '', display_order: 0, image: null }

export default function AdminCoordinators() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coordinator | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Coordinator | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  function load() {
    setIsLoading(true)
    getCoordinators().then(setCoordinators).catch(() => setCoordinators([])).finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY, display_order: coordinators.length })
    setPreview(null)
    setErrors({})
    setIsModalOpen(true)
  }

  function openEdit(c: Coordinator) {
    setEditing(c)
    setForm({ name: c.name, designation: c.designation, display_order: c.display_order, image: null })
    setPreview(c.image_url ? mediaAssetUrl(c.image_url) : null)
    setErrors({})
    setIsModalOpen(true)
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return
    setForm({ ...form, image: file })
    setPreview(URL.createObjectURL(file))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.designation.trim()) next.designation = 'Designation is required'
    if (!editing && !form.image) next.image = 'Profile image is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    const payload: CoordinatorPayload = {
      name: form.name.trim(),
      designation: form.designation.trim(),
      display_order: form.display_order,
      image: form.image,
    }
    try {
      if (editing) {
        await updateCoordinator(editing.id, payload)
        showToast('Coordinator updated')
      } else {
        await createCoordinator(payload)
        showToast('Coordinator added')
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save the coordinator.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCoordinator(deleteTarget.id)
      showToast('Coordinator removed')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not remove the coordinator.'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <AdminPageHeader
        icon={Users}
        title="Coordinators"
        subtitle={`${coordinators.length} team member${coordinators.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={openCreate} className="btn-primary !px-4 !py-2.5 !text-sm">
            <Plus size={16} /> Add Coordinator
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : coordinators.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Users}
            title="No coordinators yet"
            message="Add your team members so visitors know who's organizing the festival."
            action={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Coordinator</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {coordinators.map((c) => (
            <div key={c.id} className="card-surface p-4 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/40 mb-2.5 bg-maroon/5">
                {c.image_url ? (
                  <ImageWithFallback src={mediaAssetUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-maroon/40 font-display text-xl">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="font-semibold text-ink text-sm">{c.name}</p>
              <p className="text-ink/50 text-xs mb-3">{c.designation}</p>
              <div className="flex gap-1.5 w-full mt-auto">
                <button onClick={() => openEdit(c)} className="btn-secondary flex-1 !py-1.5 !px-2 !text-xs">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(c)} className="btn-danger flex-1 !py-1.5 !px-2 !text-xs">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Coordinator' : 'Add Coordinator'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-maroon/5 border-2 border-dashed border-maroon/20 flex items-center justify-center hover:border-saffron/50"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-maroon/30" size={24} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>
          {errors.image && <p className="text-red-600 text-xs text-center">{errors.image}</p>}

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ravi Kumar" />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Designation</label>
            <input className="input-field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="President" />
            {errors.designation && <p className="text-red-600 text-xs mt-1">{errors.designation}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              <X size={16} /> Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Coordinator'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Coordinator"
        message={`Remove "${deleteTarget?.name}" from the coordinators list?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
