import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import type { Coordinator } from '../../types'
import { getCoordinators } from '../../services/coordinators'
import { mediaAssetUrl } from '../../services/api'
import ImageWithFallback from '../ui/ImageWithFallback'
import EmptyState from '../ui/EmptyState'

export default function CoordinatorsSection() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCoordinators()
      .then((data) => setCoordinators(data.slice(0, 6)))
      .catch(() => setCoordinators([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="container-app py-10 sm:py-14">
      <div className="mb-6">
        <h2 className="font-display text-2xl sm:text-3xl text-maroon">Coordinators</h2>
        <p className="text-ink/50 text-sm mt-1">The team behind the celebration</p>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32">
              <div className="skeleton w-24 h-24 rounded-full mx-auto mb-3" />
              <div className="skeleton h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : coordinators.length === 0 ? (
        <div className="card-surface">
          <EmptyState icon={Users} title="No coordinators listed yet" message="Team member details will appear here soon." />
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:gap-6">
          {coordinators.map((c, i) => (
            <div key={c.id} className="flex-shrink-0 w-28 sm:w-auto text-center animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-gold/40 shadow-md mb-3 bg-maroon/5">
                {c.image_url ? (
                  <ImageWithFallback src={mediaAssetUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-maroon/40 font-display text-2xl">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="font-semibold text-ink text-sm leading-snug">{c.name}</p>
              <p className="text-ink/50 text-xs mt-0.5">{c.designation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Link to="/coordinators" className="btn-secondary">
          View All Coordinators <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
