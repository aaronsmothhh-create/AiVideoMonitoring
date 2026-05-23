type TrendCardProps = {
  eventTrend: number[]
  className?: string
}

export function TrendCard({ eventTrend, className = '' }: TrendCardProps) {
  const max = Math.max(...eventTrend, 0.0001)
  const peakIdx = eventTrend.findIndex((v) => Math.abs(v - max) < 1e-6)
  return (
    <div className={`rounded-xl border border-border-subtle bg-surface-container p-5 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-white">Event Frequency Trend</h3>
        <span className="font-mono text-[11px] text-status-success">+4.2% vs Yesterday</span>
      </div>
      <div className="flex h-32 items-end gap-1 px-1">
        {eventTrend.map((v, idx) => {
          const heightPct = `${Math.max(8, Math.round(v * 100))}%`
          const isPeak = idx === peakIdx
          return (
            <div
              key={idx}
              className={`flex-1 rounded-t ${
                isPeak
                  ? 'bg-primary-container shadow-cyan'
                  : v > 0.6
                  ? 'bg-primary-container/60'
                  : 'bg-surface-variant'
              }`}
              style={{ height: heightPct }}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] uppercase text-on-surface-variant">
        <span>-2h</span>
        <span>-1h</span>
        <span>30m</span>
        <span>10m</span>
        <span>NOW</span>
      </div>
    </div>
  )
}
