import { api } from './api'
import type { MediaFolder, MediaItem } from '../types'

export async function getFolders(): Promise<MediaFolder[]> {
  const { data } = await api.get<MediaFolder[]>('/api/media/folders')
  return data
}

export async function createFolder(name: string): Promise<MediaFolder> {
  const { data } = await api.post<MediaFolder>('/api/admin/media/folders', { name })
  return data
}

export async function renameFolder(id: string, name: string): Promise<MediaFolder> {
  const { data } = await api.put<MediaFolder>(`/api/admin/media/folders/${id}`, { name })
  return data
}

export async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/api/admin/media/folders/${id}`)
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const { data } = await api.get<MediaItem[]>('/api/media')
  return data
}

export async function getMediaPreview(limit = 4): Promise<MediaItem[]> {
  const { data } = await api.get<MediaItem[]>('/api/media/preview', { params: { limit } })
  return data
}

export async function getMediaByFolder(folderId: string): Promise<MediaItem[]> {
  const { data } = await api.get<MediaItem[]>(`/api/media/folder/${folderId}`)
  return data
}

export async function uploadMedia(folderId: string, files: File[]): Promise<MediaItem[]> {
  const formData = new FormData()
  formData.append('folder_id', folderId)
  files.forEach((file) => formData.append('files', file))
  const { data } = await api.post<MediaItem[]>('/api/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/api/admin/media/${id}`)
}
