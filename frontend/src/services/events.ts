import { api } from './api'
import type { FestivalEvent } from '../types'

export async function getAllEvents(): Promise<FestivalEvent[]> {
  const { data } = await api.get<FestivalEvent[]>('/api/events')
  return data
}

export async function getUpcomingEvents(limit = 3): Promise<FestivalEvent[]> {
  const { data } = await api.get<FestivalEvent[]>('/api/events/upcoming', { params: { limit } })
  return data
}

export interface EventPayload {
  title: string
  description: string
  event_datetime: string
}

export async function createEvent(payload: EventPayload): Promise<FestivalEvent> {
  const { data } = await api.post<FestivalEvent>('/api/admin/events', payload)
  return data
}

export async function updateEvent(id: string, payload: EventPayload): Promise<FestivalEvent> {
  const { data } = await api.put<FestivalEvent>(`/api/admin/events/${id}`, payload)
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/api/admin/events/${id}`)
}
