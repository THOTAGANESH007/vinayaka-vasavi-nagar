import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { downloadImage } from '../../utils/download'

export default function DownloadButton({
  url,
  filename,
  className = '',
}: {
  url: string
  filename: string
  className?: string
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setIsDownloading(true)
    try {
      await downloadImage(url, filename)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDownloading}
      aria-label="Download image"
      title="Download image"
      className={`p-1.5 rounded-full bg-ink/60 text-white hover:bg-saffron-dark transition-colors backdrop-blur-sm ${className}`}
    >
      {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
    </button>
  )
}
