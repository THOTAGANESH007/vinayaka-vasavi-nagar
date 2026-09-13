import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff, X } from 'lucide-react'
import type { MediaItem } from '../../types'
import { getMediaPreview } from '../../services/media'
import { mediaAssetUrl } from '../../services/api'
import ImageWithFallback from '../ui/ImageWithFallback'
import DownloadButton from '../ui/DownloadButton'
import EmptyState from '../ui/EmptyState'

export default function MediaPreview() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    getMediaPreview(4)
      .then(setMedia)
      .catch(() => setMedia([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="bg-cream-deep py-10 sm:py-14">
      <div className="container-app">
        <div className="mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-maroon">Festival Moments</h2>
          <p className="text-ink/50 text-sm mt-1">Glimpses from our celebrations</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square" />
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="card-surface">
            <EmptyState
              icon={ImageOff}
              title="No photos yet"
              message="Photos from our celebrations will be added here soon."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {media.map((item, i) => (
              <div
                key={item.id}
                className="relative group aspect-square rounded-2xl overflow-hidden card-surface animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="block w-full h-full"
                  aria-label={`Open ${item.image_name}`}
                >
                  <ImageWithFallback
                    src={mediaAssetUrl(item.image_url)}
                    alt={item.image_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </button>
                <DownloadButton url={mediaAssetUrl(item.image_url)} filename={item.image_name} className="absolute top-2 right-2 opacity-90" />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link to="/media" className="btn-secondary">
            View All Media <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {lightboxIndex !== null && media[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close image"
          >
            <X size={24} />
          </button>
          <DownloadButton
            url={mediaAssetUrl(media[lightboxIndex].image_url)}
            filename={media[lightboxIndex].image_name}
            className="absolute top-4 right-16 z-10 !p-2.5"
          />
          <img
            src={mediaAssetUrl(media[lightboxIndex].image_url)}
            alt={media[lightboxIndex].image_name}
            className="max-w-full max-h-[85vh] rounded-lg object-contain animate-fade-up"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
