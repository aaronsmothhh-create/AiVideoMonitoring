import {
  AlertTriangle, Camera, Cpu, Gauge, Grid3X3, Maximize2, ShieldAlert, Sparkles, TrendingUp, Video
} from 'lucide-react'
import type { DetectionCapability, EventStatus, MonitoringCamera, Overview, Role, ShiftAnalytics, TelegramPreview, VideoEvent } from '../types'
import { KpiCard } from '../components/Dashboard/KpiCard'
import { TrendCard } from '../components/Dashboard/TrendCard'
import { TelegramPreviewCard } from '../components/Dashboard/TelegramPreviewCard'
import { CapabilityCard } from '../components/Dashboard/CapabilityCard'
import { HeroSparkArt } from '../components/Dashboard/HeroSparkArt'
import { CameraFeedCard } from '../components/Cameras/CameraFeedCard'
import { ActiveCameraCard } from '../components/Cameras/ActiveCameraCard'
import { EventLogRow } from '../components/Events/EventLogRow'
import { useNavigate } from 'react-router-dom'

type OverviewPageProps = {
  overview: Overview | null
  analytics: ShiftAnalytics | null
  onlineCameraCount: number
  aiAccuracy: number
  suspiciousRate: number
  cameras: MonitoringCamera[]
  activeCamera: MonitoringCamera | null
  onSelectCamera: (id: string) => void
  events: VideoEvent[]
  eventTrend: number[]
  frameKey: number
  role: Role
  busy: boolean
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
  telegramPreview: TelegramPreview | null
  onTelegramTest: () => Promise<void>
  capabilities: DetectionCapability[]
}

export function OverviewPage(props: OverviewPageProps) {
  const {
    overview, analytics, onlineCameraCount, aiAccuracy, suspiciousRate,
    cameras, activeCamera, onSelectCamera, events, eventTrend, frameKey,
    role, busy, onFeedback, telegramPreview, onTelegramTest, capabilities,
  } = props

  const navigate = useNavigate()
  const totalCameras = analytics?.cameras_total ?? overview?.total_cameras ?? cameras.length
  const criticalEvents = analytics?.suspicious_events ?? overview?.suspicious_events ?? 0
  const openEvents = analytics?.open_events ?? overview?.open_events ?? 0

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface-container-high p-6 md:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
          <div className="z-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-container">
              <Sparkles size={14} /> Единая система безопасности
            </p>
            <h2 className="text-3xl font-bold text-white md:text-headline-lg">
              Контроль ритейла на основе AI
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-on-surface-variant">
              ИИ-видеомониторинг в реальном времени для гипермаркетов, супермаркетов и торговых
              центров. Камеры у полок, касс и складских зон, YOLOv8 для детекции людей,
              события-кандидаты с честным показателем уверенности — без обвинений до проверки оператором.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary shadow-cyan transition active:scale-[0.98]"
              >
                <ShieldAlert size={16} /> Открыть ленту событий
              </button>
              <button
                onClick={() => onSelectCamera(cameras[0]?.id ?? '')}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-bright"
              >
                <Video size={16} /> Живые камеры
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-highest">
              <HeroSparkArt />
            </div>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="bento-grid">
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Активные камеры"
          value={`${onlineCameraCount}`}
          accent={
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-status-success">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-success" />
              Онлайн · {totalCameras} всего
            </span>
          }
          icon={<Camera size={18} />}
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Открытые / Критичные"
          value={`${openEvents}`}
          accent={
            <span className="rounded border border-status-danger/30 bg-status-danger/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-status-danger">
              {criticalEvents} подозрительных
            </span>
          }
          icon={<AlertTriangle size={18} />}
          tone="danger"
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Уверенность ИИ"
          value={`${aiAccuracy}%`}
          accent={
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary-container">
              <TrendingUp size={14} /> Среднее на событие
            </span>
          }
          icon={<Cpu size={18} />}
          tone="primary"
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Здоровье смены"
          value={`${suspiciousRate}%`}
          accent={
            <span className="font-mono text-[12px] text-on-surface-variant">
              Доля подозрительных
            </span>
          }
          icon={<Gauge size={18} />}
        />
      </section>

      {/* Main content */}
      <section className="bento-grid">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-danger" />
              Кластер лив-мониторинга
            </h3>
            <div className="flex gap-2 text-on-surface-variant">
              <button className="rounded p-1 transition hover:text-on-surface" title="Сетка">
                <Grid3X3 size={16} />
              </button>
              <button className="rounded p-1 transition hover:text-on-surface" title="Полный экран">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cameras.slice(0, 6).map((camera) => (
              <CameraFeedCard
                key={camera.id}
                camera={camera}
                frameKey={frameKey}
                active={activeCamera?.id === camera.id}
                onClick={() => onSelectCamera(camera.id)}
              />
            ))}
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <div className="flex h-[420px] flex-col rounded-xl border border-border-subtle bg-surface-container">
            <div className="flex items-center justify-between border-b border-border-subtle p-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-white">
                Последние события
              </h3>
              <button
                onClick={() => navigate('/events')}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-container hover:underline"
              >
                Все события
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {events.length === 0 && (
                <p className="p-4 text-sm text-on-surface-variant">
                  Нет событий — нажмите «Симулировать событие» в правом верхнем углу.
                </p>
              )}
              {events.map((event) => (
                <EventLogRow key={event.id} event={event} role={role} busy={busy} onFeedback={onFeedback} />
              ))}
            </div>
          </div>

          <TrendCard eventTrend={eventTrend} />
          <TelegramPreviewCard preview={telegramPreview} busy={busy} onTest={onTelegramTest} />
        </div>
      </section>

      <section className="bento-grid">
        <div className="col-span-12 lg:col-span-7">
          <CapabilityCard capabilities={capabilities} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ActiveCameraCard camera={activeCamera} frameKey={frameKey} />
        </div>
      </section>
    </>
  )
}
