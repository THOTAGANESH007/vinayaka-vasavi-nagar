// Forces a real file download (rather than navigating to the image) by
// fetching it as a blob first — works across origins as long as the media
// server doesn't block CORS, and degrades gracefully to opening a new tab.
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename || 'image'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank')
  }
}
