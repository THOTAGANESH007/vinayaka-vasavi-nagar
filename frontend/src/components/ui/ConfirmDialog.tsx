import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  isDangerous = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex gap-3 items-start mb-5">
        {isDangerous && <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />}
        <p className="text-ink/70 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={isDangerous ? 'btn-danger flex-1' : 'btn-primary flex-1'}
        >
          {isLoading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
