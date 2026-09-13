import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../services/api'
import FestiveMotif from '../components/home/FestiveMotif'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }
    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
      showToast('Welcome back!')
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid username or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <FestiveMotif className="w-20 h-20" />
        </div>
        <h1 className="font-display text-2xl text-maroon text-center mb-1">Welcome back</h1>
        <p className="text-ink/50 text-sm text-center mb-8">Sign in to Vinayaka Youth Vasavi Nagar</p>

        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            <LogIn size={16} /> {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-saffron-dark font-medium hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-ink/50 mt-2">
          <Link to="/" className="text-ink/40 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
