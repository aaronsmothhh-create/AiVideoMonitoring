export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-border-subtle bg-surface-container p-5 ${className}`}>
      <div className="mb-3 h-3 w-1/3 rounded bg-surface-bright" />
      <div className="h-8 w-1/2 rounded bg-surface-bright" />
      <div className="mt-3 h-3 w-2/3 rounded bg-surface-bright" />
    </div>
  )
}

export function CameraFeedSkeleton() {
  return (
    <div className="animate-pulse aspect-video w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-container-highest">
      <div className="h-full w-full bg-surface-bright" />
    </div>
  )
}

export function EventRowSkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-3 rounded-lg border-l-4 border-l-surface-bright bg-surface-container-low p-3">
      <div className="h-8 w-8 rounded bg-surface-bright" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-surface-bright" />
        <div className="h-3 w-1/2 rounded bg-surface-bright" />
        <div className="h-3 w-1/4 rounded bg-surface-bright" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton className="h-48" />
      <div className="bento-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="col-span-12 sm:col-span-6 lg:col-span-3" />
        ))}
      </div>
      <div className="bento-grid">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CameraFeedSkeleton key={i} />
          ))}
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
