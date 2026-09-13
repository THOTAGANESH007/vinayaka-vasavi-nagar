import { Link } from 'react-router-dom'
import { Timer, CalendarDays, Images, FolderTree, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const CARDS = [
  { to: '/admin/countdown', icon: Timer, label: 'Manage Countdown', desc: 'Set the active festival countdown' },
  { to: '/admin/events', icon: CalendarDays, label: 'Manage Events', desc: 'Add, edit or remove events' },
  { to: '/admin/media', icon: Images, label: 'Manage Media', desc: 'Upload and organize photos' },
  { to: '/admin/media', icon: FolderTree, label: 'Manage Folders', desc: 'Create and rename media folders' },
  { to: '/admin/coordinators', icon: Users, label: 'Manage Coordinators', desc: 'Add or update team members' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-saffron-dark text-xs font-semibold uppercase tracking-wider mb-1">Admin</p>
        <h1 className="font-display text-2xl sm:text-3xl text-maroon">Welcome, {user?.username}</h1>
        <p className="text-ink/50 text-sm mt-1">Manage all dynamic content for the festival site</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="card-surface p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
              <card.icon className="text-saffron-dark" size={24} />
            </div>
            <div>
              <p className="font-semibold text-ink">{card.label}</p>
              <p className="text-ink/50 text-sm mt-0.5">{card.desc}</p>
            </div>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="card-surface p-5 flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.98] text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="text-red-600" size={22} />
          </div>
          <div>
            <p className="font-semibold text-ink">Logout</p>
            <p className="text-ink/50 text-sm mt-0.5">End your admin session</p>
          </div>
        </button>
      </div>
    </div>
  )
}
