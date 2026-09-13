import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-full bg-saffron/10 flex items-center justify-center mb-4">
        <Icon className="text-saffron-dark" size={28} />
      </div>
      <h3 className="font-display text-lg text-maroon mb-1.5">{title}</h3>
      <p className="text-sm text-ink/60 max-w-xs mb-5">{message}</p>
      {action}
    </div>
  )
}
