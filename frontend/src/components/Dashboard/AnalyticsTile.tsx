type AnalyticsTileProps = {
  label: string
  value: string | number
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'muted'
}

export function AnalyticsTile({ label, value, tone = 'primary' }: AnalyticsTileProps) {
  const toneClass =
    tone === 'success'
      ? 'text-status-success'
      : tone === 'warning'
      ? 'text-status-warning'
      : tone === 'danger'
      ? 'text-status-danger'
      : tone === 'muted'
      ? 'text-on-surface-variant'
      : 'text-primary-container'
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-container-low p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}
