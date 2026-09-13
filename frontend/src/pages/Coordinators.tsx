import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import type { Coordinator } from '../types'
import { getCoordinators } from '../services/coordinators'
import { mediaAssetUrl } from '../services/api'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import EmptyState from '../components/ui/EmptyState'

export default function Coordinators() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCoordinators()
      .then(setCoordinators)
      .catch(() => setCoordinators([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-maroon mb-1.5">Coordinators</h1>
        <p className="text-ink/50 text-sm">Meet the team organizing this year's celebration</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="skeleton w-24 h-24 rounded-full mx-auto mb-3" />
              <div className="skeleton h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : coordinators.length === 0 ? (
        <div className="card-surface max-w-md mx-auto">
          <EmptyState icon={Users} title="No coordinators listed yet" message="Team member details will appear here soon." />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {coordinators.map((c, i) => (
            <div key={c.id} className="text-center animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-gold/40 shadow-md mb-3 bg-maroon/5">
                {c.image_url ? (
                  <ImageWithFallback src={mediaAssetUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-maroon/40 font-display text-2xl">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="font-semibold text-ink text-sm">{c.name}</p>
              <p className="text-ink/50 text-xs mt-0.5">{c.designation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
