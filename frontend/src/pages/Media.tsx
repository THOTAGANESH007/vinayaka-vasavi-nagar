import { useEffect, useState } from 'react'
import { Folder, ImageOff, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react'
import type { MediaFolder, MediaItem } from '../types'
import { getFolders, getMediaByFolder } from '../services/media'
import { mediaAssetUrl } from '../services/api'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import DownloadButton from '../components/ui/DownloadButton'
import EmptyState from '../components/ui/EmptyState'

export default function Media() {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [previews, setPreviews] = useState<Record<string, MediaItem[]>>({})
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)

  const [activeFolder, setActiveFolder] = useState<MediaFolder | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    getFolders()
      .then(async (data) => {
        setFolders(data)
        const withPhotos = data.filter((f) => f.media_count > 0)
        const entries = await Promise.all(
          withPhotos.map(async (f) => {
            const media = await getMediaByFolder(f.id).catch(() => [])
            return [f.id, media.slice(0, 4)] as const
          })
        )
        setPreviews(Object.fromEntries(entries))
      })
      .catch(() => setFolders([]))
      .finally(() => setIsLoadingFolders(false))
  }, [])

  function openFolder(folder: MediaFolder) {
    setActiveFolder(folder)
    setIsLoadingItems(true)
    getMediaByFolder(folder.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setIsLoadingItems(false))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeFolder() {
    setActiveFolder(null)
    setItems([])
  }

  function nextImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % items.length)
  }
  function prevImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)
  }

  const foldersWithPhotos = folders.filter((f) => f.media_count > 0)

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-maroon mb-1.5">Media Gallery</h1>
        <p className="text-ink/50 text-sm">Moments from our celebrations, organized by folder</p>
      </div>

      {!activeFolder ? (
        isLoadingFolders ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14" />)}
            </div>
          </div>
        ) : folders.length === 0 ? (
          <div className="card-surface max-w-md mx-auto">
            <EmptyState icon={Folder} title="No folders yet" message="Photo folders will appear here once the admin adds them." />
          </div>
        ) : (
          <div>
            {/* Quick folder navigation */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => openFolder(folder)}
                  className="flex-shrink-0 flex items-center gap-2 rounded-full border border-maroon/15 bg-white px-4 py-2 text-sm font-medium text-ink/70 hover:border-saffron/50 hover:text-saffron-dark transition-colors"
                >
                  <Folder size={14} className="text-saffron-dark" />
                  {folder.name}
                  <span className="text-ink/35 text-xs">({folder.media_count})</span>
                </button>
              ))}
            </div>

            {/* Per-folder preview sections */}
            {foldersWithPhotos.length === 0 ? (
              <div className="card-surface max-w-md mx-auto">
                <EmptyState icon={ImageOff} title="No photos yet" message="Photos will appear here once folders have images uploaded." />
              </div>
            ) : (
              <div className="space-y-10">
                {foldersWithPhotos.map((folder) => (
                  <section key={folder.id}>
                    <button
                      onClick={() => openFolder(folder)}
                      className="flex items-center justify-between w-full mb-3 group"
                    >
                      <h2 className="font-display text-lg sm:text-xl text-maroon group-hover:text-saffron-dark transition-colors">
                        {folder.name}
                        <span className="text-ink/40 text-sm font-body ml-2">({folder.media_count})</span>
                      </h2>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-saffron-dark font-medium flex-shrink-0">
                        View all <ArrowRight size={14} />
                      </span>
                    </button>
                    <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                      {(previews[folder.id] || []).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openFolder(folder)}
                          className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden card-surface"
                        >
                          <ImageWithFallback
                            src={mediaAssetUrl(item.image_url)}
                            alt={item.image_name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <div>
          <button onClick={closeFolder} className="flex items-center gap-1.5 text-maroon font-medium text-sm mb-5 hover:underline">
            <ChevronLeft size={16} /> All Folders
          </button>
          <h2 className="font-display text-xl text-maroon mb-5">{activeFolder.name}</h2>

          {isLoadingItems ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton mb-3 sm:mb-4 break-inside-avoid" style={{ height: `${140 + (i % 3) * 60}px` }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card-surface max-w-md mx-auto">
              <EmptyState icon={ImageOff} title="No photos in this folder" message="Photos will appear here once they're uploaded." />
            </div>
          ) : (
            // Natural-size masonry layout — images are shown at their uploaded aspect ratio, never cropped.
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {items.map((item, i) => (
                <div key={item.id} className="relative group mb-3 sm:mb-4 break-inside-avoid rounded-2xl overflow-hidden card-surface animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <button onClick={() => setLightboxIndex(i)} className="block w-full">
                    <ImageWithFallback src={mediaAssetUrl(item.image_url)} alt={item.image_name} className="w-full h-auto block" />
                  </button>
                  <DownloadButton
                    url={mediaAssetUrl(item.image_url)}
                    filename={item.image_name}
                    className="absolute top-2 right-2 opacity-90"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxIndex !== null && items[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10" onClick={() => setLightboxIndex(null)}>
            <X size={24} />
          </button>
          <DownloadButton
            url={mediaAssetUrl(items[lightboxIndex].image_url)}
            filename={items[lightboxIndex].image_name}
            className="absolute top-4 right-16 z-10 !p-2.5"
          />
          {items.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <img
            src={mediaAssetUrl(items[lightboxIndex].image_url)}
            alt={items[lightboxIndex].image_name}
            className="max-w-full max-h-[85vh] rounded-lg object-contain animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
