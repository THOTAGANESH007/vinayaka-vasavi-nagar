import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/media', label: 'Media' },
  { to: '/coordinators', label: 'Coordinators' },
]

export default function Header() {
  const { user, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [])

  function handleLogout() {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-maroon/10 shadow-sm">
      <div className="container-app flex items-center justify-between h-14 sm:h-16">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src="/favicon.svg" alt="" className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0" />
          <span className="font-display text-maroon text-sm sm:text-base leading-tight truncate">
            Vinayaka Youth<br className="sm:hidden" /> <span className="hidden sm:inline">Vasavi Nagar</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-saffron-dark ${isActive ? 'text-maroon font-semibold' : 'text-ink/70'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <Link to="/login" className="btn-primary !px-4 !py-2 !text-xs sm:!text-sm sm:!px-6 sm:!py-2.5">
              Login
            </Link>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-maroon/20 pl-2 pr-3 py-1.5 hover:bg-maroon/5 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-maroon text-cream flex items-center justify-center text-xs font-semibold">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline text-sm text-ink/80 max-w-[100px] truncate">
                  {user.username}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-maroon/10 py-1.5 z-50 animate-fade-up">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-cream"
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/50">
                      <UserIcon size={16} /> {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-maroon/5 text-maroon"
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-maroon/10 bg-cream animate-fade-up">
          <div className="container-app py-2 flex flex-col">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `py-3 text-sm border-b border-maroon/5 last:border-0 ${
                    isActive ? 'text-maroon font-semibold' : 'text-ink/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
