import { SlidersHorizontal } from 'lucide-react'
import type { EventStatus, Filters, MonitoringCamera, Role, VideoEvent } from '../types'
import { EVENT_TYPE_LABELS, STATUS_LABELS } from '../constants'
import { FilterField } from '../components/common/FilterField'
import { EventDetailCard } from '../components/Events/EventDetailCard'

type EventsPageProps = {
  cameras: MonitoringCamera[]
  events: VideoEvent[]
  filters: Filters
  busy: boolean
  role: Role
  onChangeFilters: (filters: Filters) => void
  onApply: () => Promise<void>
  onReset: () => Promise<void>
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
}

export function EventsPage({ cameras, events, filters, busy, role, onChangeFilters, onApply, onReset, onFeedback }: EventsPageProps) {
  return (
    <section className="bento-grid">
      <aside className="col-span-12 lg:col-span-3">
        <div className="rounded-xl border border-border-subtle bg-surface-container p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary-container" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-white">Filters</h2>
          </div>
          <div className="space-y-3">
            <FilterField label="Камера">
              <select
                className="aegis-input w-full rounded-lg px-3 py-2 text-sm"
                value={filters.cameraId}
                onChange={(event) => onChangeFilters({ ...filters, cameraId: event.target.value })}
              >
                <option value="">Все камеры</option>
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Тип события">
              <select
                className="aegis-input w-full rounded-lg px-3 py-2 text-sm"
                value={filters.type}
                onChange={(event) => onChangeFilters({ ...filters, type: event.target.value })}
              >
                <option value="">Все типы</option>
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Статус">
              <select
                className="aegis-input w-full rounded-lg px-3 py-2 text-sm"
                value={filters.status}
                onChange={(event) => onChangeFilters({ ...filters, status: event.target.value })}
              >
                <option value="">Все статусы</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="С даты">
              <input
                type="datetime-local"
                className="aegis-input w-full rounded-lg px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={(event) => onChangeFilters({ ...filters, dateFrom: event.target.value })}
              />
            </FilterField>
            <FilterField label="По дату">
              <input
                type="datetime-local"
                className="aegis-input w-full rounded-lg px-3 py-2 text-sm"
                value={filters.dateTo}
                onChange={(event) => onChangeFilters({ ...filters, dateTo: event.target.value })}
              />
            </FilterField>
            <button
              onClick={() => void onApply()}
              disabled={busy}
              className="w-full rounded-lg bg-primary-container px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-on-primary-container shadow-cyan transition active:scale-[0.98] disabled:opacity-60"
            >
              Применить
            </button>
            <button
              onClick={() => void onReset()}
              disabled={busy}
              className="w-full rounded-lg border border-border-subtle px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant transition hover:bg-surface-bright hover:text-on-surface"
            >
              Сбросить
            </button>
          </div>
        </div>
      </aside>

      <div className="col-span-12 space-y-3 lg:col-span-9">
        <div className="rounded-xl border border-border-subtle bg-surface-container p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-white">
              События ({events.length})
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Severity colour-coded
            </span>
          </div>
        </div>
        {events.length === 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface-container p-8 text-center text-on-surface-variant">
            Нет событий по выбранным фильтрам.
          </div>
        )}
        {events.map((event) => (
          <EventDetailCard key={event.id} event={event} busy={busy} role={role} onFeedback={onFeedback} />
        ))}
      </div>
    </section>
  )
}
