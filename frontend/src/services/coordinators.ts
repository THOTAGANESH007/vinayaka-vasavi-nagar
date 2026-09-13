import { api } from './api'
import type { Coordinator } from '../types'

export async function getCoordinators(): Promise<Coordinator[]> {
  const { data } = await api.get<Coordinator[]>('/api/coordinators')
  return data
}

export interface CoordinatorPayload {
  name: string
  designation: string
  display_order: number
  image: File | null
}

export async function createCoordinator(payload: CoordinatorPayload): Promise<Coordinator> {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('designation', payload.designation)
  formData.append('display_order', String(payload.display_order))
  if (payload.image) formData.append('image', payload.image)
  const { data } = await api.post<Coordinator>('/api/admin/coordinators', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateCoordinator(id: string, payload: CoordinatorPayload): Promise<Coordinator> {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('designation', payload.designation)
  formData.append('display_order', String(payload.display_order))
  if (payload.image) formData.append('image', payload.image)
  const { data } = await api.put<Coordinator>(`/api/admin/coordinators/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteCoordinator(id: string): Promise<void> {
  await api.delete(`/api/admin/coordinators/${id}`)
}
