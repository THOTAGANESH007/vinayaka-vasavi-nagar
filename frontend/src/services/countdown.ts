import { api } from './api'
import type { Countdown } from '../types'

export async function getActiveCountdown(): Promise<Countdown | null> {
  const { data } = await api.get<Countdown | null>('/api/countdown/active')
  return data
}

export interface CountdownPayload {
  event_name: string
  event_datetime: string
  description_before_event: string
  completion_title: string
  completion_description: string
}

export async function createCountdown(payload: CountdownPayload): Promise<Countdown> {
  const { data } = await api.post<Countdown>('/api/admin/countdown', payload)
  return data
}

export async function updateCountdown(id: string, payload: CountdownPayload): Promise<Countdown> {
  const { data } = await api.put<Countdown>(`/api/admin/countdown/${id}`, payload)
  return data
}

export async function deleteCountdown(id: string): Promise<void> {
  await api.delete(`/api/admin/countdown/${id}`)
}

export async function listCountdowns(): Promise<Countdown[]> {
  const { data } = await api.get<Countdown[]>('/api/admin/countdown')
  return data
}
