import { useEffect, useState } from 'react'
import { CalendarDays, Clock, CalendarX } from 'lucide-react'
import type { FestivalEvent } from '../types'
import { getAllEvents } from '../services/events'
import { formatEventDate, formatEventTime } from '../utils/format'
import { SkeletonGrid } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function Events() {
  const [events, setEvents] = useState<FestivalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-maroon mb-1.5">All Events</h1>
        <p className="text-ink/50 text-sm">Every celebration, sorted by date</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : events.length === 0 ? (
        <div className="card-surface max-w-md mx-auto">
          <EmptyState icon={CalendarX} title="No events scheduled" message="New festival events will appear here as they're added." />
        </div>
      ) : (
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-[27px] sm:left-[31px] top-2 bottom-2 w-px bg-maroon/10" />
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={event.id} className="relative pl-16 sm:pl-20 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="absolute left-0 top-1 w-14 sm:w-16 flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-saffron flex items-center justify-center shadow-md z-10">
                    <CalendarDays size={14} className="text-white" />
                  </div>
                </div>
                <div className="card-surface p-4 sm:p-5">
                  <p className="text-saffron-dark text-xs font-semibold mb-1.5">
                    {formatEventDate(event.event_datetime)}
                  </p>
                  <h3 className="font-display text-lg text-ink mb-1.5">{event.title}</h3>
                  {event.description && <p className="text-ink/60 text-sm mb-3 leading-relaxed">{event.description}</p>}
                  <div className="flex items-center gap-1.5 text-ink/45 text-xs">
                    <Clock size={13} /> {formatEventTime(event.event_datetime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
