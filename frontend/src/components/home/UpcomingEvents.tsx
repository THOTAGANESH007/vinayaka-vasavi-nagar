import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, ArrowRight, CalendarX } from 'lucide-react'
import type { FestivalEvent } from '../../types'
import { getUpcomingEvents } from '../../services/events'
import { formatEventDate, formatEventTime } from '../../utils/format'
import { SkeletonGrid } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

export default function UpcomingEvents() {
  const [events, setEvents] = useState<FestivalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getUpcomingEvents(3)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="container-app py-10 sm:py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-maroon">Upcoming Events</h2>
          <p className="text-ink/50 text-sm mt-1">What's happening next</p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : events.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={CalendarX}
            title="No upcoming events yet"
            message="Check back soon — new festival events will appear here as they're scheduled."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <div
              key={event.id}
              className="card-surface p-5 flex flex-col animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 text-saffron-dark text-xs font-semibold mb-3">
                <CalendarDays size={15} />
                {formatEventDate(event.event_datetime)}
              </div>
              <h3 className="font-display text-lg text-ink mb-2 leading-snug">{event.title}</h3>
              {event.description && (
                <p className="text-ink/60 text-sm mb-4 line-clamp-3 flex-1">{event.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-ink/50 text-xs mt-auto pt-3 border-t border-maroon/5">
                <Clock size={13} />
                {formatEventTime(event.event_datetime)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Link to="/events" className="btn-secondary">
          View All Events <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
