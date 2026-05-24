import { Settings, Users } from 'lucide-react'
import type { DetectionCapability, MonitoringSettings, Role } from '../types'
import { ROLE_LABELS } from '../constants'
import { FilterField } from '../components/common/FilterField'
import { CapabilityCard } from '../components/Dashboard/CapabilityCard'

type SettingsPageProps = {
  settings: MonitoringSettings
  role: Role
  busy: boolean
  onChange: (settings: MonitoringSettings) => void
  onSave: () => Promise<void>
  capabilities: DetectionCapability[]
}

export function SettingsPage({ settings, role, busy, onChange, onSave, capabilities }: SettingsPageProps) {
  return (
    <section className="bento-grid">
      <div className="col-span-12 lg:col-span-8">
        <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-headline-md font-semibold text-white">
              <Settings size={20} className="text-primary-container" /> Пороги детекции
            </h2>
            <p className="text-sm text-on-surface-variant">
              Простая адаптация MVP под торговую точку клиента.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FilterField label="Отсутствие сотрудника, мин">
              <input
                type="number"
                min={1}
                className="aegis-input w-full rounded-lg px-3 py-2"
                value={settings.absence_threshold_minutes}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    absence_threshold_minutes: Number(event.target.value),
                  })
                }
              />
            </FilterField>
            <FilterField label="Долгое нахождение у полки, сек">
              <input
                type="number"
                min={5}
                className="aegis-input w-full rounded-lg px-3 py-2"
                value={settings.shelf_dwell_seconds}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    shelf_dwell_seconds: Number(event.target.value),
                  })
                }
              />
            </FilterField>
            <FilterField label="Порог уверенности">
              <input
                type="number"
                step={0.05}
                min={0.1}
                max={0.99}
                className="aegis-input w-full rounded-lg px-3 py-2"
                value={settings.confidence_threshold}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    confidence_threshold: Number(event.target.value),
                  })
                }
              />
            </FilterField>
          </div>
          <button
            onClick={() => void onSave()}
            disabled={busy || role !== 'admin'}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary-container shadow-cyan transition active:scale-[0.98] disabled:opacity-60"
          >
            Сохранить настройки
          </button>
          {role !== 'admin' && (
            <p className="mt-3 text-sm text-on-surface-variant">
              Только администратор может изменять пороги системы.
            </p>
          )}
        </div>

        <div className="mt-4">
          <CapabilityCard capabilities={capabilities} />
        </div>
      </div>

      <div className="col-span-12 space-y-4 lg:col-span-4">
        <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
          <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white">
            <Users size={16} className="text-primary-container" /> Роли
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Визуальные бейджи без полноценной авторизации.
          </p>
          <div className="mt-4 rounded-xl border border-border-subtle bg-surface-container-low p-4 text-sm text-on-surface">
            <p className="font-semibold text-white">{ROLE_LABELS[role]}</p>
            <p className="mt-2 text-xs text-on-surface-variant">
              Текущая роль экспортируется из аутентификации. Админ имеет доступ к настройкам и Telegram.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
