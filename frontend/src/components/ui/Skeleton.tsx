export function CardSkeleton() {
  return (
    <div className="card-surface p-4">
      <div className="skeleton h-32 w-full mb-3" />
      <div className="skeleton h-4 w-2/3 mb-2" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  )
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
