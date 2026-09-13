import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../services/api'
import FestiveMotif from '../components/home/FestiveMotif'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    else if (password.length < 6) next.password = 'Password must be at least 6 characters'
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await signup(name.trim(), email.trim(), password)
      showToast('Account created — welcome!')
      navigate('/')
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not create your account. Please try again.'))
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
        <h1 className="font-display text-2xl text-maroon text-center mb-1">Create your account</h1>
        <p className="text-ink/50 text-sm text-center mb-8">
          Sign up to Vinayaka Youth Vasavi Nagar — you can browse and download photos without an account too.
        </p>

        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Priya Sharma"
              autoComplete="name"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder="At least 6 characters"
                autoComplete="new-password"
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
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            <UserPlus size={16} /> {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-saffron-dark font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
