import { CheckCircle2, XCircle } from 'lucide-react'
import type { EventStatus, Role, VideoEvent } from '../../types'
import { eventBorderClass, statusBadgeClass, severityBadgeClass, snapshotSrc } from '../../utils/helpers'
import { STATUS_LABELS, EVENT_TYPE_LABELS, ROLE_LABELS } from '../../constants'

type EventDetailCardProps = {
  event: VideoEvent
  busy: boolean
  role: Role
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
}

export function EventDetailCard({ event, busy, role, onFeedback }: EventDetailCardProps) {
  return (
    <article className={`rounded-xl border border-l-4 border-border-subtle bg-surface-container p-5 ${eventBorderClass(event.severity)}`}>
      <div className="flex flex-col gap-5 xl:flex-row">
        <img
          src={snapshotSrc(event)}
          alt={event.title}
          className="aspect-video w-full rounded-lg border border-border-subtle bg-surface-container-highest object-cover xl:w-80"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(event.status)}`}>
              {STATUS_LABELS[event.status]}
            </span>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severityBadgeClass(event.severity)}`}>
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            <span className="rounded-full bg-surface-bright px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {Math.round(event.confidence * 100)}% confidence
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{event.title}</h3>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{event.description}</p>
          <div className="mt-3 rounded-lg border border-primary-container/20 bg-primary-container/5 p-3 text-sm text-on-surface">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Анализ признаков</p>
            <p className="mt-1 leading-6">{event.analysis_summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {event.evidence_tags.map((tag) => (
                <span key={tag} className="rounded bg-primary-container/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
            {event.camera_name} · {event.zone} · {new Date(event.detected_at).toLocaleString('ru-RU')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={busy || event.status === 'confirmed'}
              onClick={() => void onFeedback(event.id, 'confirmed')}
              className="flex items-center gap-2 rounded-lg bg-status-success/15 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-status-success hover:bg-status-success/25 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Подтвердить ({ROLE_LABELS[role]})
            </button>
            <button
              disabled={busy || event.status === 'dismissed'}
              onClick={() => void onFeedback(event.id, 'dismissed')}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface disabled:opacity-50"
            >
              <XCircle size={14} /> Отклонить
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
