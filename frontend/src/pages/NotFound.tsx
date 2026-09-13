import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import FestiveMotif from '../components/home/FestiveMotif'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <FestiveMotif className="w-24 h-24 mb-4 opacity-60" />
      <h1 className="font-display text-2xl text-maroon mb-2">Page not found</h1>
      <p className="text-ink/50 text-sm mb-6 max-w-xs">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  )
}
