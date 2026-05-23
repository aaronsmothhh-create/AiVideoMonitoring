import type { ReactNode } from 'react'

type KpiCardProps = {
  colSpan: string
  label: string
  value: string
  accent: ReactNode
  icon: ReactNode
  tone?: 'primary' | 'danger' | 'neutral'
}

export function KpiCard({ colSpan, label, value, accent, icon, tone = 'neutral' }: KpiCardProps) {
  const iconTone =
    tone === 'danger'
      ? 'bg-status-danger/15 text-status-danger'
      : tone === 'primary'
      ? 'bg-primary-container/15 text-primary-container shadow-cyan'
      : 'bg-surface-bright text-on-surface-variant'
  const valueTone =
    tone === 'danger' ? 'text-status-danger' : tone === 'primary' ? 'text-primary-container' : 'text-white'
  return (
    <article className={`${colSpan} flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-container p-5`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTone}`}>{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-3xl font-bold ${valueTone}`}>{value}</span>
        {accent}
      </div>
    </article>
  )
}
