import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export default function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-maroon/70 hover:text-maroon mb-4">
        <ChevronLeft size={16} /> Dashboard
      </Link>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-maroon/10 flex items-center justify-center flex-shrink-0">
            <Icon className="text-maroon" size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl text-maroon leading-tight">{title}</h1>
            <p className="text-ink/50 text-xs sm:text-sm">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}
