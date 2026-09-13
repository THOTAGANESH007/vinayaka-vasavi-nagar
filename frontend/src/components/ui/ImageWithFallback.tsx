import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className={`flex items-center justify-center bg-maroon/5 ${className || ''}`}>
        <ImageOff className="text-maroon/30" size={24} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
    />
  )
}
