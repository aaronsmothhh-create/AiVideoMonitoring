import type { Severity, EventStatus, MonitoringCamera, VideoEvent, Filters } from '../types'
import { API_URL } from '../api/client'

export function buildEventQuery(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.cameraId) params.set('camera_id', filters.cameraId)
  if (filters.type) params.set('event_type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateFrom) params.set('date_from', new Date(filters.dateFrom).toISOString())
  if (filters.dateTo) params.set('date_to', new Date(filters.dateTo).toISOString())
  const query = params.toString()
  return query ? `/api/events?${query}` : '/api/events'
}

export function reportHref(kind: 'csv' | 'pdf', start?: string, end?: string) {
  if (start && end) {
    const params = new URLSearchParams({ start, end })
    return `${API_URL}/api/reports/period.${kind}?${params.toString()}`
  }
  return `${API_URL}/api/reports/day.${kind}`
}

export function snapshotSrc(event: VideoEvent) {
  if (event.snapshot_url.startsWith('http')) return event.snapshot_url
  return `${API_URL}${event.snapshot_url}`
}

export function cameraLiveSrc(camera: MonitoringCamera, frameKey: number) {
  const usesLiveFrame = camera.source_type === 'live_mjpeg' || camera.source_type === 'retail_scene'
  if (usesLiveFrame) {
    return `${API_URL}/api/cameras/${camera.id}/frame_analyzed.jpg?t=${frameKey}`
  }
  return `${API_URL}/api/cameras/${camera.id}/live.svg`
}

export function severityBadgeClass(severity: Severity) {
  if (severity === 'high') return 'border-status-danger/40 bg-status-danger/10 text-status-danger'
  if (severity === 'medium') return 'border-status-warning/40 bg-status-warning/10 text-status-warning'
  return 'border-status-success/40 bg-status-success/10 text-status-success'
}

export function statusBadgeClass(status: EventStatus) {
  if (status === 'confirmed') return 'bg-status-success/15 text-status-success border border-status-success/30'
  if (status === 'dismissed') return 'bg-surface-bright/40 text-on-surface-variant border border-outline-variant'
  return 'bg-primary-container/15 text-primary-container border border-primary-container/30'
}

export function cameraStatusDot(status: MonitoringCamera['status']) {
  if (status === 'online') return 'bg-status-success'
  if (status === 'unstable') return 'bg-status-warning'
  return 'bg-status-danger'
}

export function eventBorderClass(severity: Severity) {
  if (severity === 'high') return 'border-l-status-danger'
  if (severity === 'medium') return 'border-l-status-warning'
  return 'border-l-primary-container'
}

export function formatSeconds(seconds?: number | null) {
  if (!seconds || seconds <= 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)} сек`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} мин`
  return `${Math.round(minutes / 60)} ч`
}

export function timeAgo(iso: string): string {
  const dt = new Date(iso).getTime()
  if (Number.isNaN(dt)) return '—'
  const diff = Math.max(0, Date.now() - dt)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function qualityLabel(score?: number) {
  if (score === undefined) return '—'
  return `${Math.round(score > 1 ? score : score * 100)}%`
}
