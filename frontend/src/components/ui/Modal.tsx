import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-cream rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-cream/95 backdrop-blur border-b border-maroon/10 rounded-t-3xl">
          <h3 className="text-lg font-display text-maroon">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-maroon/10 text-ink/60" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
