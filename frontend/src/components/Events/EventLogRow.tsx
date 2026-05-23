import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import type { EventStatus, Role, VideoEvent } from '../../types'
import { eventBorderClass, statusBadgeClass, severityBadgeClass, timeAgo } from '../../utils/helpers'
import { STATUS_LABELS, ROLE_LABELS } from '../../constants'

type EventLogRowProps = {
  event: VideoEvent
  role: Role
  busy: boolean
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
}

export function EventLogRow({ event, role, busy, onFeedback }: EventLogRowProps) {
  const iconColor =
    event.severity === 'high'
      ? 'text-status-danger bg-status-danger/15'
      : event.severity === 'medium'
      ? 'text-status-warning bg-status-warning/15'
      : 'text-primary-container bg-primary-container/15'
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 bg-surface-container-low p-3 transition hover:bg-surface-bright ${eventBorderClass(event.severity)}`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded ${iconColor}`}>
        <ShieldAlert size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">{event.title}</p>
          <span className="shrink-0 font-mono text-[10px] text-on-surface-variant">{timeAgo(event.detected_at)}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
          {event.camera_name} · {event.zone}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(event.status)}`}>
            {STATUS_LABELS[event.status]}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityBadgeClass(event.severity)}`}>
            {Math.round(event.confidence * 100)}%
          </span>
          {event.status === 'new' && (
            <div className="ml-auto flex gap-1">
              <button
                disabled={busy}
                onClick={() => void onFeedback(event.id, 'confirmed')}
                className="rounded bg-status-success/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-status-success hover:bg-status-success/25 disabled:opacity-50"
                title={`Подтвердить (${ROLE_LABELS[role]})`}
              >
                <CheckCircle2 size={12} />
              </button>
              <button
                disabled={busy}
                onClick={() => void onFeedback(event.id, 'dismissed')}
                className="rounded bg-surface-bright px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
                title="Отклонить"
              >
                <XCircle size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
