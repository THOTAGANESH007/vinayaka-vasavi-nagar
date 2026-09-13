import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Images, Trash2, Upload, Pencil, X, FolderPlus, ChevronLeft } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ImageWithFallback from '../../components/ui/ImageWithFallback'
import DownloadButton from '../../components/ui/DownloadButton'
import type { MediaFolder, MediaItem } from '../../types'
import {
  getFolders, createFolder, renameFolder, deleteFolder,
  getMediaByFolder, uploadMedia, deleteMedia,
} from '../../services/media'
import { mediaAssetUrl, getApiErrorMessage } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function AdminMedia() {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)
  const [activeFolder, setActiveFolder] = useState<MediaFolder | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [folderBeingEdited, setFolderBeingEdited] = useState<MediaFolder | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderError, setFolderError] = useState('')
  const [isSavingFolder, setIsSavingFolder] = useState(false)
  const [folderDeleteTarget, setFolderDeleteTarget] = useState<MediaFolder | null>(null)
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFolderId, setUploadFolderId] = useState('')
  const [creatingNewFolder, setCreatingNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mediaDeleteTarget, setMediaDeleteTarget] = useState<MediaItem | null>(null)
  const [isDeletingMedia, setIsDeletingMedia] = useState(false)

  const { showToast } = useToast()

  function loadFolders() {
    setIsLoadingFolders(true)
    getFolders().then(setFolders).catch(() => setFolders([])).finally(() => setIsLoadingFolders(false))
  }

  useEffect(loadFolders, [])

  function openFolder(folder: MediaFolder) {
    setActiveFolder(folder)
    setIsLoadingItems(true)
    getMediaByFolder(folder.id).then(setItems).catch(() => setItems([])).finally(() => setIsLoadingItems(false))
  }

  function refreshActiveFolder() {
    if (activeFolder) openFolder(activeFolder)
    loadFolders()
  }

  // ---------- Folder create/rename ----------
  function openCreateFolder() {
    setFolderBeingEdited(null)
    setFolderName('')
    setFolderError('')
    setIsFolderModalOpen(true)
  }

  function openRenameFolder(folder: MediaFolder) {
    setFolderBeingEdited(folder)
    setFolderName(folder.name)
    setFolderError('')
    setIsFolderModalOpen(true)
  }

  async function handleFolderSubmit(e: FormEvent) {
    e.preventDefault()
    if (!folderName.trim()) {
      setFolderError('Folder name is required')
      return
    }
    setIsSavingFolder(true)
    try {
      if (folderBeingEdited) {
        await renameFolder(folderBeingEdited.id, folderName.trim())
        showToast('Folder renamed')
      } else {
        await createFolder(folderName.trim())
        showToast('Folder created')
      }
      setIsFolderModalOpen(false)
      loadFolders()
    } catch (err) {
      setFolderError(getApiErrorMessage(err, 'Could not save the folder.'))
    } finally {
      setIsSavingFolder(false)
    }
  }

  async function handleDeleteFolder() {
    if (!folderDeleteTarget) return
    setIsDeletingFolder(true)
    try {
      await deleteFolder(folderDeleteTarget.id)
      showToast('Folder deleted')
      if (activeFolder?.id === folderDeleteTarget.id) {
        setActiveFolder(null)
        setItems([])
      }
      setFolderDeleteTarget(null)
      loadFolders()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete the folder.'), 'error')
    } finally {
      setIsDeletingFolder(false)
    }
  }

  // ---------- Upload ----------
  function openUploadModal() {
    setUploadFolderId(activeFolder?.id || folders[0]?.id || '')
    setCreatingNewFolder(folders.length === 0)
    setNewFolderName('')
    setSelectedFiles([])
    setUploadError('')
    setIsUploadModalOpen(true)
  }

  async function handleUploadSubmit(e: FormEvent) {
    e.preventDefault()
    setUploadError('')

    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one image')
      return
    }

    let targetFolderId = uploadFolderId

    setIsUploading(true)
    try {
      if (creatingNewFolder) {
        if (!newFolderName.trim()) {
          setUploadError('Please enter a name for the new folder')
          setIsUploading(false)
          return
        }
        const folder = await createFolder(newFolderName.trim())
        targetFolderId = folder.id
      }

      if (!targetFolderId) {
        setUploadError('Please select a folder')
        setIsUploading(false)
        return
      }

      await uploadMedia(targetFolderId, selectedFiles)
      showToast(`${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} uploaded`)
      setIsUploadModalOpen(false)
      loadFolders()
      if (activeFolder?.id === targetFolderId) openFolder(activeFolder)
    } catch (err) {
      setUploadError(getApiErrorMessage(err, 'Upload failed. Please check the file formats and try again.'))
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteMedia() {
    if (!mediaDeleteTarget) return
    setIsDeletingMedia(true)
    try {
      await deleteMedia(mediaDeleteTarget.id)
      showToast('Image deleted')
      setMediaDeleteTarget(null)
      refreshActiveFolder()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete the image.'), 'error')
    } finally {
      setIsDeletingMedia(false)
    }
  }

  return (
    <div className="container-app py-8 sm:py-12">
      <AdminPageHeader
        icon={Images}
        title="Media"
        subtitle={`${folders.length} folder${folders.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <button onClick={openCreateFolder} className="btn-secondary !px-4 !py-2.5 !text-sm">
              <FolderPlus size={16} /> New Folder
            </button>
            <button onClick={openUploadModal} className="btn-primary !px-4 !py-2.5 !text-sm">
              <Upload size={16} /> Upload
            </button>
          </div>
        }
      />

      {!activeFolder ? (
        isLoadingFolders ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-[4/3]" />)}
          </div>
        ) : folders.length === 0 ? (
          <div className="card-surface">
            <EmptyState
              icon={Images}
              title="No folders yet"
              message="Create a folder to start organizing your festival photos."
              action={<button onClick={openCreateFolder} className="btn-primary"><FolderPlus size={16} /> New Folder</button>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="card-surface p-4 flex flex-col">
                <button onClick={() => openFolder(folder)} className="flex flex-col items-center text-center flex-1 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center mb-2.5">
                    <Images className="text-saffron-dark" size={20} />
                  </div>
                  <p className="font-semibold text-ink text-sm">{folder.name}</p>
                  <p className="text-ink/40 text-xs mt-0.5">{folder.media_count} photo{folder.media_count !== 1 ? 's' : ''}</p>
                </button>
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-maroon/5">
                  <button onClick={() => openRenameFolder(folder)} className="flex-1 flex items-center justify-center gap-1 text-xs text-ink/60 hover:text-maroon py-1.5 rounded-lg hover:bg-maroon/5">
                    <Pencil size={12} /> Rename
                  </button>
                  <button onClick={() => setFolderDeleteTarget(folder)} className="flex-1 flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <button onClick={() => { setActiveFolder(null); setItems([]) }} className="flex items-center gap-1.5 text-maroon font-medium text-sm mb-5 hover:underline">
            <ChevronLeft size={16} /> All Folders
          </button>
          <h2 className="font-display text-xl text-maroon mb-5">{activeFolder.name}</h2>

          {isLoadingItems ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton mb-3 break-inside-avoid" style={{ height: `${140 + (i % 3) * 60}px` }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card-surface">
              <EmptyState
                icon={Images}
                title="No photos in this folder"
                message="Upload some photos to get started."
                action={<button onClick={openUploadModal} className="btn-primary"><Upload size={16} /> Upload</button>}
              />
            </div>
          ) : (
            // Natural-size masonry — images are shown at their uploaded aspect ratio, never cropped.
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {items.map((item) => (
                <div key={item.id} className="relative group mb-3 break-inside-avoid rounded-2xl overflow-hidden card-surface">
                  <ImageWithFallback src={mediaAssetUrl(item.image_url)} alt={item.image_name} className="w-full h-auto block" />
                  <DownloadButton url={mediaAssetUrl(item.image_url)} filename={item.image_name} className="absolute top-2 right-11" />
                  <button
                    onClick={() => setMediaDeleteTarget(item)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-ink/60 text-white hover:bg-red-600 transition-colors"
                    aria-label="Delete image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Rename Folder Modal */}
      <Modal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} title={folderBeingEdited ? 'Rename Folder' : 'New Folder'}>
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Folder Name</label>
            <input
              className="input-field"
              placeholder="Ganesh Chaturthi 2026"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
            {folderError && <p className="text-red-600 text-xs mt-1">{folderError}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsFolderModalOpen(false)} className="btn-secondary flex-1">
              <X size={16} /> Cancel
            </button>
            <button type="submit" disabled={isSavingFolder} className="btn-primary flex-1">
              {isSavingFolder ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Images">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{uploadError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Select Folder</label>
            {!creatingNewFolder ? (
              <select
                className="input-field"
                value={uploadFolderId}
                onChange={(e) => setUploadFolderId(e.target.value)}
              >
                {folders.length === 0 && <option value="">No folders yet</option>}
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            ) : (
              <input
                className="input-field"
                placeholder="Enter new folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            )}
            <button
              type="button"
              onClick={() => setCreatingNewFolder((v) => !v)}
              className="text-saffron-dark text-xs font-semibold mt-2 hover:underline"
            >
              {creatingNewFolder ? '← Choose an existing folder' : '+ Create New Folder'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Images</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-maroon/20 rounded-xl py-8 flex flex-col items-center gap-2 text-ink/50 hover:border-saffron/50 hover:text-saffron-dark transition-colors"
            >
              <Upload size={24} />
              <span className="text-sm">{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Tap to select images'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {selectedFiles.map((file, i) => (
                  <img key={i} src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn-secondary flex-1">
              <X size={16} /> Cancel
            </button>
            <button type="submit" disabled={isUploading} className="btn-primary flex-1">
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!folderDeleteTarget}
        title="Delete Folder"
        message={`Delete "${folderDeleteTarget?.name}" and all ${folderDeleteTarget?.media_count || 0} photo(s) inside it? This cannot be undone.`}
        isLoading={isDeletingFolder}
        onConfirm={handleDeleteFolder}
        onCancel={() => setFolderDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!mediaDeleteTarget}
        title="Delete Image"
        message="Are you sure you want to delete this image? This cannot be undone."
        isLoading={isDeletingMedia}
        onConfirm={handleDeleteMedia}
        onCancel={() => setMediaDeleteTarget(null)}
      />
    </div>
  )
}
