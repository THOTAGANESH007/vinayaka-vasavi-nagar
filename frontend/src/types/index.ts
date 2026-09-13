export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface Countdown {
  id: string
  event_name: string
  event_datetime: string
  description_before_event: string | null
  completion_title: string
  completion_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestivalEvent {
  id: string
  title: string
  description: string | null
  event_datetime: string
  created_at: string
  updated_at: string
}

export interface MediaFolder {
  id: string
  name: string
  created_at: string
  updated_at: string
  media_count: number
}

export interface MediaItem {
  id: string
  folder_id: string
  image_url: string
  image_name: string
  created_at: string
}

export interface Coordinator {
  id: string
  name: string
  designation: string
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}
