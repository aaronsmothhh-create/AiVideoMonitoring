import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  Cpu,
  Download,
  FileText,
  Gauge,
  Grid3X3,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Menu,
  Package,
  PlayCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShoppingCart,
  SignalHigh,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Wifi,
  XCircle,
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || window.location.origin

type EventType =
  | 'employee_absence'
  | 'employee_presence'
  | 'visitor_shelf_dwell'
  | 'hand_to_body'
  | 'back_to_camera'
  | 'system_stream_lost'

type EventStatus = 'new' | 'confirmed' | 'dismissed'
type Severity = 'low' | 'medium' | 'high'
type Role = 'admin' | 'operator' | 'manager'
type Tab = 'overview' | 'events' | 'analytics' | 'cameras' | 'settings'

type Overview = {
  active_cameras: number
  total_cameras: number
  open_events: number
  confirmed_events: number
  absence_events: number
  suspicious_events: number
  telegram_configured: boolean
}

type Zone = {
  id: string
  name: string
  kind: 'work_area' | 'shelf' | 'entrance' | 'checkout' | 'stock'
}

type SourceType =
  | 'demo_video'
  | 'rtsp'
  | 'mock_rtsp'
  | 'public_dataset'
  | 'public_webcam_archive'
  | 'live_mjpeg'
  | 'retail_scene'

type MonitoringCamera = {
  id: string
  name: string
  location: string
  rtsp_url: string
  status: 'online' | 'unstable' | 'offline'
  ai_status: 'running' | 'warming_up' | 'disabled'
  fps: number
  zones: Zone[]
  last_seen_at: string
  source_type?: SourceType
  quality_score?: number
  uptime_minutes?: number
  last_event_title?: string | null
  last_event_at?: string | null
}

type VideoEvent = {
  id: string
  camera_id: string
  camera_name: string
  type: EventType
  severity: Severity
  title: string
  description: string
  zone: string
  detected_at: string
  snapshot_url: string
  status: EventStatus
  confidence: number
  feedback_note: string | null
  reviewed_by: string | null
  telegram_sent: boolean
  reaction_seconds?: number | null
  analysis_summary: string
  evidence_tags: string[]
}

type ShiftAnalytics = {
  report_date: string
  shift_started_at: string
  total_events: number
  open_events: number
  confirmed_events: number
  dismissed_events: number
  absence_events: number
  suspicious_events: number
  average_reaction_seconds: number
  cameras_online: number
  cameras_total: number
  telegram_configured: boolean
}

type MonitoringSettings = {
  absence_threshold_minutes: number
  shelf_dwell_seconds: number
  confidence_threshold: number
}

type TelegramButton = {
  label: string
  action: string
  callback_data: string
}

type TelegramPreview = {
  mode: 'telegram' | 'mock'
  text: string
  buttons: TelegramButton[]
}

type TelegramTestResponse = {
  configured: boolean
  sent: boolean
  mode: 'telegram' | 'mock'
  detail: string
  inline_feedback: boolean
  preview: TelegramPreview
}

type User = {
  username: string
  role: Role
}

type AuthLoginResponse = {
  access_token: string
  token_type: 'bearer'
  expires_at: string
  user: User
}

type PublicVideoSource = {
  id: string
  title: string
  camera_id: string
  source_url: string
  scenario: string
  license_note: string
  supported_signals: string[]
}

type DetectionCapability = {
  id: string
  title: string
  readiness: 'demo_ready' | 'heuristic_ready' | 'pilot_needed'
  confidence: number
  what_it_checks: string
  evidence: string[]
  current_limitations: string
  tz_mapping: string
}

type Filters = {
  cameraId: string
  type: string
  status: string
  dateFrom: string
  dateTo: string
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  employee_absence: 'Отсутствие сотрудника',
  employee_presence: 'Появление сотрудника',
  visitor_shelf_dwell: 'Долгое нахождение у полки',
  hand_to_body: 'Рука к телу/сумке',
  back_to_camera: 'Спиной к камере',
  system_stream_lost: 'Проблема RTSP',
}

const STATUS_LABELS: Record<EventStatus, string> = {
  new: 'Новое',
  confirmed: 'Подтверждено',
  dismissed: 'Отклонено',
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Админ',
  operator: 'Оператор',
  manager: 'Руководитель',
}

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview',
  events: 'Events',
  analytics: 'Analytics',
  cameras: 'Cameras',
  settings: 'Settings',
}

const emptyFilters: Filters = {
  cameraId: '',
  type: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('AegisAuthToken')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

function AuthImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let objectUrl = ''
    const controller = new AbortController()

    const token = localStorage.getItem('AegisAuthToken')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(src, { headers, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (mounted) setBlobUrl(objectUrl)
      })
      .catch(() => {
        if (mounted) setBlobUrl(null)
      })

    return () => {
      mounted = false
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  return <img src={blobUrl ?? ''} alt={alt ?? ''} className={className} />
}

function buildEventQuery(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.cameraId) params.set('camera_id', filters.cameraId)
  if (filters.type) params.set('event_type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateFrom) params.set('date_from', new Date(filters.dateFrom).toISOString())
  if (filters.dateTo) params.set('date_to', new Date(filters.dateTo).toISOString())
  const query = params.toString()
  return query ? `/api/events?${query}` : '/api/events'
}

function reportHref(kind: 'csv' | 'pdf', start?: string, end?: string) {
  if (start && end) {
    const params = new URLSearchParams({ start, end })
    return `${API_URL}/api/reports/period.${kind}?${params.toString()}`
  }
  return `${API_URL}/api/reports/day.${kind}`
}

function snapshotSrc(event: VideoEvent) {
  if (event.snapshot_url.startsWith('http')) return event.snapshot_url
  return `${API_URL}${event.snapshot_url}`
}

function cameraLiveSrc(camera: MonitoringCamera, frameKey: number) {
  const usesLiveFrame = camera.source_type === 'live_mjpeg' || camera.source_type === 'retail_scene'
  if (usesLiveFrame) {
    return `${API_URL}/api/cameras/${camera.id}/frame_analyzed.jpg?t=${frameKey}`
  }
  return `${API_URL}/api/cameras/${camera.id}/live.svg`
}

function cameraIcon(camera: MonitoringCamera) {
  const id = camera.id
  if (id.includes('checkout')) return <ShoppingCart size={16} />
  if (id.includes('warehouse')) return <Package size={16} />
  if (id.includes('entrance') || id.includes('mall')) return <Users size={16} />
  if (id.includes('produce') || id.includes('beverage') || id.includes('frozen')) return <Video size={16} />
  return <Camera size={16} />
}

function severityBadgeClass(severity: Severity) {
  if (severity === 'high') return 'border-status-danger/40 bg-status-danger/10 text-status-danger'
  if (severity === 'medium') return 'border-status-warning/40 bg-status-warning/10 text-status-warning'
  return 'border-status-success/40 bg-status-success/10 text-status-success'
}

function statusBadgeClass(status: EventStatus) {
  if (status === 'confirmed') return 'bg-status-success/15 text-status-success border border-status-success/30'
  if (status === 'dismissed') return 'bg-surface-bright/40 text-on-surface-variant border border-outline-variant'
  return 'bg-primary-container/15 text-primary-container border border-primary-container/30'
}

function cameraStatusDot(status: MonitoringCamera['status']) {
  if (status === 'online') return 'bg-status-success'
  if (status === 'unstable') return 'bg-status-warning'
  return 'bg-status-danger'
}

function eventBorderClass(severity: Severity) {
  if (severity === 'high') return 'border-l-status-danger'
  if (severity === 'medium') return 'border-l-status-warning'
  return 'border-l-primary-container'
}

function formatSeconds(seconds?: number | null) {
  if (!seconds || seconds <= 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)} сек`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} мин`
  return `${Math.round(minutes / 60)} ч`
}

function timeAgo(iso: string): string {
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

function qualityLabel(score?: number) {
  if (score === undefined) return '—'
  return `${Math.round(score > 1 ? score : score * 100)}%`
}

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: 'overview', label: TAB_LABELS.overview, icon: <LayoutDashboard size={18} /> },
  { id: 'events', label: TAB_LABELS.events, icon: <ShieldAlert size={18} /> },
  { id: 'analytics', label: TAB_LABELS.analytics, icon: <BarChart3 size={18} /> },
  { id: 'cameras', label: TAB_LABELS.cameras, icon: <Video size={18} /> },
  { id: 'settings', label: TAB_LABELS.settings, icon: <Settings size={18} /> },
]

function App() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [analytics, setAnalytics] = useState<ShiftAnalytics | null>(null)
  const [cameras, setCameras] = useState<MonitoringCamera[]>([])
  const [events, setEvents] = useState<VideoEvent[]>([])
  const [settings, setSettings] = useState<MonitoringSettings | null>(null)
  const [telegramPreview, setTelegramPreview] = useState<TelegramPreview | null>(null)
  const [publicSources, setPublicSources] = useState<PublicVideoSource[]>([])
  const [capabilities, setCapabilities] = useState<DetectionCapability[]>([])
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [role, setRole] = useState<Role>('operator')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [frameKey, setFrameKey] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const loadEvents = useCallback(async (nextFilters: Filters) => {
    const eventData = await fetchJson<VideoEvent[]>(buildEventQuery(nextFilters))
    setEvents(eventData)
    return eventData
  }, [])

  const loadDashboard = useCallback(async () => {
    setError(null)
    const [overviewData, cameraData, analyticsData, settingsData, eventData, sourceData, capabilityData] =
      await Promise.all([
        fetchJson<Overview>('/api/overview'),
        fetchJson<MonitoringCamera[]>('/api/cameras'),
        fetchJson<ShiftAnalytics>('/api/shift/analytics'),
        fetchJson<MonitoringSettings>('/api/settings'),
        fetchJson<VideoEvent[]>(buildEventQuery(filters)),
        fetchJson<PublicVideoSource[]>('/api/public-sources'),
        fetchJson<DetectionCapability[]>('/api/detection-capabilities'),
      ])
    setOverview(overviewData)
    setCameras(cameraData)
    setAnalytics(analyticsData)
    setSettings(settingsData)
    setEvents(eventData)
    setPublicSources(sourceData)
    setCapabilities(capabilityData)

    if (cameraData.length > 0 && activeCameraId === null) {
      const defaultCamera = cameraData.find((c) => c.source_type === 'retail_scene') ?? cameraData[0]
      setActiveCameraId(defaultCamera.id)
    }

    if (eventData.length > 0) {
      const preview = await fetchJson<TelegramPreview>(`/api/telegram/preview?event_id=${eventData[0].id}`)
      setTelegramPreview(preview)
    }
  }, [filters, activeCameraId])

  const handleLogin = async () => {
    setBusy(true)
    setAuthError(null)
    try {
      const response = await fetchJson<AuthLoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      localStorage.setItem('AegisAuthToken', response.access_token)
      setCurrentUser(response.user)
      setRole(response.user.role)
      setLoginPassword('')
      setLoginUsername('')
      await loadDashboard()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('AegisAuthToken')
    setCurrentUser(null)
    setRole('operator')
    setOverview(null)
    setAnalytics(null)
    setCameras([])
    setEvents([])
    setSettings(null)
    setPublicSources([])
    setCapabilities([])
    setNotice('Выход выполнен')
  }

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('AegisAuthToken')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const user = await fetchJson<User>('/api/auth/me')
        setCurrentUser(user)
        setRole(user.role)
        await loadDashboard()
      } catch (err) {
        localStorage.removeItem('AegisAuthToken')
        setAuthError('Сессия истекла. Пожалуйста, войдите снова.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [loadDashboard])

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameKey((prev) => prev + 1)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (notice === null) return
    const id = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(id)
  }, [notice])

  useEffect(() => {
    if (error === null) return
    const id = setTimeout(() => setError(null), 8000)
    return () => clearTimeout(id)
  }, [error])

  const suspiciousRate = useMemo(() => {
    if (overview === null || analytics === null || analytics.total_events === 0) return 0
    return Math.round((overview.suspicious_events / analytics.total_events) * 100)
  }, [analytics, overview])

  const aiAccuracy = useMemo(() => {
    if (events.length === 0) return 94
    const avg = events.reduce((acc, ev) => acc + ev.confidence, 0) / events.length
    return Math.round(avg * 100)
  }, [events])

  const onlineCameraCount = useMemo(
    () => cameras.filter((c) => c.status === 'online').length,
    [cameras]
  )

  const eventTrend = useMemo(() => {
    if (events.length === 0) return Array(10).fill(0.18)
    const buckets = Array(10).fill(0)
    events.forEach((event, idx) => {
      const bucket = idx % buckets.length
      buckets[bucket] += event.severity === 'high' ? 1.0 : event.severity === 'medium' ? 0.6 : 0.3
    })
    const max = Math.max(...buckets, 1)
    return buckets.map((b) => Math.max(0.15, b / max))
  }, [events])

  const activeCamera = useMemo(() => {
    return cameras.find((c) => c.id === activeCameraId) ?? cameras[0] ?? null
  }, [cameras, activeCameraId])

  const filteredCameras = useMemo(() => {
    if (!searchValue.trim()) return cameras
    const q = searchValue.toLowerCase()
    return cameras.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    )
  }, [cameras, searchValue])

  const handleRefresh = async () => {
    setBusy(true)
    try {
      await loadDashboard()
      setNotice('Данные обновлены')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления')
    } finally {
      setBusy(false)
    }
  }

  const handleApplyFilters = async () => {
    setBusy(true)
    try {
      await loadEvents(filters)
      setNotice('Фильтры применены')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка фильтрации')
    } finally {
      setBusy(false)
    }
  }

  const handleResetFilters = async () => {
    setBusy(true)
    try {
      setFilters(emptyFilters)
      await loadEvents(emptyFilters)
      setNotice('Фильтры сброшены')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сброса фильтров')
    } finally {
      setBusy(false)
    }
  }

  const handleSimulate = async () => {
    setBusy(true)
    try {
      const fallbackCamera = cameras.find((c) => c.source_type === 'retail_scene') ?? cameras[0]
      const targetCameraId = activeCamera?.id ?? fallbackCamera?.id ?? 'cam-hypermarket-frozen'
      const event = await fetchJson<VideoEvent>('/api/events/simulate', {
        method: 'POST',
        body: JSON.stringify({ camera_id: targetCameraId }),
      })
      setFilters(emptyFilters)
      await loadDashboard()
      setNotice(`Событие создано: ${event.title}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка симуляции события')
    } finally {
      setBusy(false)
    }
  }

  const handleFeedback = async (eventId: string, status: EventStatus) => {
    setBusy(true)
    try {
      await fetchJson<VideoEvent>(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewed_by: ROLE_LABELS[role], note: 'Feedback from dashboard' }),
      })
      await loadDashboard()
      setNotice(status === 'confirmed' ? 'Событие подтверждено' : 'Событие отклонено')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки feedback')
    } finally {
      setBusy(false)
    }
  }

  const handleTelegramTest = async () => {
    setBusy(true)
    try {
      const result = await fetchJson<TelegramTestResponse>('/api/telegram/test', { method: 'POST' })
      setTelegramPreview(result.preview)
      setNotice(result.configured ? result.detail : 'Telegram не настроен — показан mock-preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка Telegram test')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveSettings = async () => {
    if (settings === null) return
    setBusy(true)
    try {
      const nextSettings = await fetchJson<MonitoringSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
      setSettings(nextSettings)
      setNotice('Пороги сохранены')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения настроек')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-container px-6 py-4 shadow-cyan">
          <RefreshCw className="animate-spin text-primary-container" size={22} />
          <span className="font-medium">Loading Aegis AI Operations Center…</span>
        </div>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        <div className="w-full max-w-sm rounded-3xl border border-border-subtle bg-surface-container p-8 shadow-cyan">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-white">Aegis AI Login</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Войдите в консоль мониторинга, чтобы получить доступ к дашборду и отчетам.
            </p>
          </div>
          {authError && (
            <div className="mb-4 rounded-xl border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-status-danger">
              {authError}
            </div>
          )}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-on-surface-variant">Username</label>
            <input
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
              className="aegis-input w-full rounded-2xl border border-border-subtle bg-surface-container-low px-4 py-3 text-sm text-on-surface"
              autoComplete="username"
            />
            <label className="block text-sm font-semibold text-on-surface-variant">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="aegis-input w-full rounded-2xl border border-border-subtle bg-surface-container-low px-4 py-3 text-sm text-on-surface"
              autoComplete="current-password"
            />
            <button
              onClick={() => void handleLogin()}
              disabled={busy || !loginUsername || !loginPassword}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-on-primary-container shadow-cyan transition disabled:opacity-50"
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border-subtle bg-surface-container md:flex">
        <div className="flex h-full flex-col p-6">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/20 text-primary-container shadow-cyan">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h1 className="text-headline-md font-bold text-primary">Aegis AI</h1>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Vigilant AI Active
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-cyan'
                      : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                  }`}
                >
                  {item.icon}
                  <span className="text-[12px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto space-y-1 pt-4">
            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary transition active:scale-[0.98]"
              href={reportHref('pdf')}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={16} /> Export Reports
            </a>
            <button className="flex w-full items-center gap-4 rounded-lg p-3 text-left text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface">
              <HelpCircle size={18} />
              <span className="text-[12px] font-bold uppercase tracking-widest">Help</span>
            </button>
            <button
              onClick={() => handleLogout()}
              className="flex w-full items-center gap-4 rounded-lg p-3 text-left text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
            >
              <LogOut size={18} />
              <span className="text-[12px] font-bold uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen w-full flex-col pb-20 md:ml-64 md:pb-0">
        {/* Top app bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-base/90 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant">
              <Menu size={22} />
            </button>
            <span className="text-headline-md font-bold text-primary">Operations Center</span>
            <div className="ml-2 hidden items-center gap-4 lg:flex">
              <span className="rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-container">
                {currentUser ? ROLE_LABELS[currentUser.role] : 'Guest'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                className="aegis-input w-44 rounded-lg pl-9 pr-3 py-1.5 text-sm placeholder:text-on-surface-variant lg:w-56"
                placeholder="Поиск камер…"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
            <button
              className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-variant active:scale-95"
              onClick={() => void handleRefresh()}
              disabled={busy}
              title="Обновить"
            >
              <RefreshCw size={18} className={busy ? 'animate-spin' : ''} />
            </button>
            {currentUser?.role === 'admin' && (
              <button
                className="hidden rounded-full p-2 text-on-surface-variant transition hover:bg-surface-variant active:scale-95 sm:block"
                title="Telegram test"
                onClick={() => void handleTelegramTest()}
              >
                <Bell size={18} />
              </button>
            )}
            <button
              className="flex items-center gap-2 rounded-lg bg-primary-container px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-primary-container shadow-cyan transition active:scale-95 sm:px-4"
              onClick={() => void handleSimulate()}
              disabled={busy}
            >
              <Sparkles size={14} /> Simulate Event
            </button>
          </div>
        </header>

        {/* Notifications */}
        {(error !== null || notice !== null) && (
          <div className="px-4 pt-4 md:px-6">
            {error !== null && (
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-status-danger">
                <AlertTriangle size={18} className="mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {notice !== null && (
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-status-success/40 bg-status-success/10 px-4 py-3 text-status-success">
                <CheckCircle2 size={18} className="mt-0.5" />
                <span className="text-sm">{notice}</span>
              </div>
            )}
          </div>
        )}

        {/* Content area */}
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8">
          {activeTab === 'overview' && (
            <OverviewTab
              overview={overview}
              analytics={analytics}
              onlineCameraCount={onlineCameraCount}
              aiAccuracy={aiAccuracy}
              suspiciousRate={suspiciousRate}
              cameras={filteredCameras}
              activeCamera={activeCamera}
              onSelectCamera={(id) => setActiveCameraId(id)}
              events={events.slice(0, 6)}
              eventTrend={eventTrend}
              frameKey={frameKey}
              role={role}
              busy={busy}
              onFeedback={handleFeedback}
              onJumpToEvents={() => setActiveTab('events')}
              telegramPreview={telegramPreview}
              onTelegramTest={handleTelegramTest}
              capabilities={capabilities}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              cameras={cameras}
              events={events}
              filters={filters}
              busy={busy}
              role={role}
              onChangeFilters={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              onFeedback={handleFeedback}
            />
          )}

          {activeTab === 'analytics' && analytics !== null && (
            <AnalyticsTab
              analytics={analytics}
              eventTrend={eventTrend}
              telegramPreview={telegramPreview}
              busy={busy}
              onTelegramTest={handleTelegramTest}
            />
          )}

          {activeTab === 'cameras' && (
            <CamerasTab
              cameras={filteredCameras}
              publicSources={publicSources}
              frameKey={frameKey}
            />
          )}

          {activeTab === 'settings' && settings !== null && (
            <SettingsTab
              settings={settings}
              role={role}
              busy={busy}
              onChange={setSettings}
              onSave={handleSaveSettings}
              capabilities={capabilities}
            />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border-subtle bg-surface-base px-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 ${
                active ? 'text-primary-container' : 'text-on-surface-variant'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ===================== Tabs =====================

type OverviewTabProps = {
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
  onJumpToEvents: () => void
  telegramPreview: TelegramPreview | null
  onTelegramTest: () => Promise<void>
  capabilities: DetectionCapability[]
}

function OverviewTab(props: OverviewTabProps) {
  const {
    overview,
    analytics,
    onlineCameraCount,
    aiAccuracy,
    suspiciousRate,
    cameras,
    activeCamera,
    onSelectCamera,
    events,
    eventTrend,
    frameKey,
    role,
    busy,
    onFeedback,
    onJumpToEvents,
    telegramPreview,
    onTelegramTest,
    capabilities,
  } = props

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
              <Sparkles size={14} /> Unified Security Intelligence
            </p>
            <h2 className="text-3xl font-bold text-white md:text-headline-lg">
              Контроль ритейла на основе AI
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-on-surface-variant">
              Real-time AI-видеомониторинг для гипермаркетов, супермаркетов и торговых
              центров. Камеры у полок, касс и складских зон, YOLOv8 для детекции людей,
              события-кандидаты с честным confidence — без обвинений до проверки оператором.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onJumpToEvents}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary shadow-cyan transition active:scale-[0.98]"
              >
                <ShieldAlert size={16} /> Открыть ленту событий
              </button>
              <button
                onClick={() => onSelectCamera(cameras[0]?.id ?? '')}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-bright"
              >
                <Video size={16} /> Live cameras
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
          label="Total Active Cameras"
          value={`${onlineCameraCount}`}
          accent={
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-status-success">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-success" />
              Online · {totalCameras} total
            </span>
          }
          icon={<Camera size={18} />}
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Open / Critical Events"
          value={`${openEvents}`}
          accent={
            <span className="rounded border border-status-danger/30 bg-status-danger/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-status-danger">
              {criticalEvents} suspicious
            </span>
          }
          icon={<AlertTriangle size={18} />}
          tone="danger"
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="AI Detection Confidence"
          value={`${aiAccuracy}%`}
          accent={
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary-container">
              <TrendingUp size={14} /> Avg per event
            </span>
          }
          icon={<Cpu size={18} />}
          tone="primary"
        />
        <KpiCard
          colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Shift Health"
          value={`${suspiciousRate}%`}
          accent={
            <span className="font-mono text-[12px] text-on-surface-variant">
              Suspicious rate
            </span>
          }
          icon={<Gauge size={18} />}
        />
      </section>

      {/* Main content */}
      <section className="bento-grid">
        {/* Live monitoring cluster */}
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span className="h-2 w-2 animate-pulse rounded-full bg-status-danger" />
              Live Monitoring Cluster
            </h3>
            <div className="flex gap-2 text-on-surface-variant">
              <button className="rounded p-1 transition hover:text-on-surface" title="Grid view">
                <Grid3X3 size={16} />
              </button>
              <button className="rounded p-1 transition hover:text-on-surface" title="Fullscreen">
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

        {/* Events + insights */}
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <div className="flex h-[420px] flex-col rounded-xl border border-border-subtle bg-surface-container">
            <div className="flex items-center justify-between border-b border-border-subtle p-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-white">
                Recent Event Logs
              </h3>
              <button
                onClick={onJumpToEvents}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-container hover:underline"
              >
                View all
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {events.length === 0 && (
                <p className="p-4 text-sm text-on-surface-variant">
                  Нет событий — нажмите «Simulate Event» в правом верхнем углу.
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

      {/* Capabilities + cameras */}
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

// ===================== Events tab =====================

type EventsTabProps = {
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

function EventsTab({ cameras, events, filters, busy, role, onChangeFilters, onApply, onReset, onFeedback }: EventsTabProps) {
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

// ===================== Analytics tab =====================

type AnalyticsTabProps = {
  analytics: ShiftAnalytics
  eventTrend: number[]
  telegramPreview: TelegramPreview | null
  busy: boolean
  onTelegramTest: () => Promise<void>
}

function AnalyticsTab({ analytics, eventTrend, telegramPreview, busy, onTelegramTest }: AnalyticsTabProps) {
  return (
    <section className="bento-grid">
      <div className="col-span-12 lg:col-span-8">
        <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-headline-md font-semibold text-white">Журнал смены</h2>
            <span className="font-mono text-xs text-on-surface-variant">Дата: {analytics.report_date}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <AnalyticsTile label="Всего событий" value={analytics.total_events} />
            <AnalyticsTile label="Подтверждено" value={analytics.confirmed_events} tone="success" />
            <AnalyticsTile label="Отклонено" value={analytics.dismissed_events} tone="muted" />
            <AnalyticsTile label="Новые" value={analytics.open_events} tone="primary" />
            <AnalyticsTile label="Отсутствия" value={analytics.absence_events} tone="warning" />
            <AnalyticsTile label="Подозрительные" value={analytics.suspicious_events} tone="danger" />
            <AnalyticsTile label="Avg реакция" value={formatSeconds(analytics.average_reaction_seconds)} />
            <AnalyticsTile
              label="Telegram"
              value={analytics.telegram_configured ? 'Настроен' : 'Mock'}
              tone={analytics.telegram_configured ? 'success' : 'muted'}
            />
          </div>
        </div>
        <TrendCard eventTrend={eventTrend} className="mt-4" />
      </div>

      <div className="col-span-12 space-y-4 lg:col-span-4">
        <ReportsCard />
        <TelegramPreviewCard preview={telegramPreview} busy={busy} onTest={onTelegramTest} />
      </div>
    </section>
  )
}

// ===================== Cameras tab =====================

type CamerasTabProps = {
  cameras: MonitoringCamera[]
  publicSources: PublicVideoSource[]
  frameKey: number
}

function CamerasTab({ cameras, publicSources, frameKey }: CamerasTabProps) {
  return (
    <section className="space-y-6">
      <div className="bento-grid">
        {cameras.map((camera) => (
          <article
            key={camera.id}
            className="col-span-12 overflow-hidden rounded-xl border border-border-subtle bg-surface-container transition hover:border-primary-container/60 md:col-span-6 xl:col-span-4"
          >
            <div className="relative aspect-video bg-surface-container-highest">
              <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={`Live ${camera.name}`} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
                {camera.status}
              </div>
              <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container backdrop-blur-md">
                {camera.source_type === 'retail_scene'
                  ? 'Retail synthetic'
                  : camera.source_type === 'live_mjpeg'
                  ? 'Live MJPEG'
                  : camera.source_type ?? '—'}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  {cameraIcon(camera)}
                  {camera.name}
                </h3>
                <p className="text-sm text-on-surface-variant">{camera.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <CameraStat label="Status" value={camera.status} />
                <CameraStat label="AI" value={camera.ai_status} />
                <CameraStat label="FPS" value={camera.fps.toString()} />
                <CameraStat label="Quality" value={qualityLabel(camera.quality_score)} />
                <CameraStat label="Uptime" value={formatSeconds((camera.uptime_minutes ?? 0) * 60)} />
                <CameraStat
                  label="Last frame"
                  value={timeAgo(camera.last_seen_at)}
                />
              </div>

              <div className="rounded-lg border border-border-subtle bg-surface-container-low p-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Source</p>
                <p className="break-all font-mono text-xs text-on-surface">{camera.rtsp_url}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {camera.zones.map((zone) => (
                  <span
                    key={zone.id}
                    className="rounded-full border border-primary-container/30 bg-primary-container/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container"
                  >
                    {zone.kind} · {zone.name}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
        <h3 className="mb-4 text-[12px] font-bold uppercase tracking-widest text-white">
          Источники видео (synthetic + public)
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {publicSources.map((source) => (
            <a
              key={source.id}
              href={source.source_url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-border-subtle bg-surface-container-low p-3 transition hover:border-primary-container/40 hover:bg-surface-bright"
            >
              <span className="text-sm font-semibold text-white">{source.title}</span>
              <p className="mt-1 text-xs text-on-surface-variant">{source.scenario}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {source.supported_signals.map((sig) => (
                  <span key={sig} className="rounded bg-primary-container/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                    {sig}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===================== Settings tab =====================

type SettingsTabProps = {
  settings: MonitoringSettings
  role: Role
  busy: boolean
  onChange: (settings: MonitoringSettings) => void
  onSave: () => Promise<void>
  capabilities: DetectionCapability[]
}

function SettingsTab({ settings, role, busy, onChange, onSave, capabilities }: SettingsTabProps) {
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
            <FilterField label="Confidence threshold">
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

// ===================== Subcomponents =====================

type KpiCardProps = {
  colSpan: string
  label: string
  value: string
  accent: ReactNode
  icon: ReactNode
  tone?: 'primary' | 'danger' | 'neutral'
}

function KpiCard({ colSpan, label, value, accent, icon, tone = 'neutral' }: KpiCardProps) {
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

type CameraFeedCardProps = {
  camera: MonitoringCamera
  frameKey: number
  active: boolean
  onClick: () => void
}

function CameraFeedCard({ camera, frameKey, active, onClick }: CameraFeedCardProps) {
  return (
    <button
      onClick={onClick}
      className={`camera-feed group relative aspect-video w-full overflow-hidden rounded-lg border bg-surface-container-highest text-left transition ${
        active
          ? 'border-primary-container glow-cyan'
          : 'border-border-subtle hover:border-primary-container/60'
      }`}
    >
      <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={camera.name} className={`h-full w-full object-cover transition ${active ? '' : 'opacity-85 group-hover:opacity-100'}`} />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
        LIVE
      </div>
      <div className="camera-meta absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-black/60 p-3 opacity-0 transition-opacity backdrop-blur-md">
        <div>
          <p className="font-mono text-[12px] font-medium text-white">{camera.name.toUpperCase()}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            FPS {camera.fps} · Quality {qualityLabel(camera.quality_score)}
          </p>
        </div>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
          active ? 'text-primary-container' : 'text-on-surface-variant'
        }`}>
          {cameraIcon(camera)}
        </span>
      </div>
    </button>
  )
}

type EventLogRowProps = {
  event: VideoEvent
  role: Role
  busy: boolean
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
}

function EventLogRow({ event, role, busy, onFeedback }: EventLogRowProps) {
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

type EventDetailCardProps = {
  event: VideoEvent
  busy: boolean
  role: Role
  onFeedback: (eventId: string, status: EventStatus) => Promise<void>
}

function EventDetailCard({ event, busy, role, onFeedback }: EventDetailCardProps) {
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

type TrendCardProps = {
  eventTrend: number[]
  className?: string
}

function TrendCard({ eventTrend, className = '' }: TrendCardProps) {
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

type CapabilityCardProps = { capabilities: DetectionCapability[] }

function readinessLabel(readiness: DetectionCapability['readiness']) {
  if (readiness === 'demo_ready') return 'Demo-ready'
  if (readiness === 'heuristic_ready') return 'Heuristic ready'
  return 'Pilot needed'
}

function CapabilityCard({ capabilities }: CapabilityCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white">
        <Cpu size={16} className="text-primary-container" />
        Detection capabilities
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Что уже умеем выявлять, какие признаки используем и где честные ограничения MVP.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {capabilities.map((capability) => (
          <article
            key={capability.id}
            className="flex flex-col rounded-lg border border-border-subtle bg-surface-container-low p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">{capability.title}</h4>
              <span className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                {Math.round(capability.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{capability.what_it_checks}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {capability.evidence.slice(0, 4).map((item) => (
                <span key={item} className="rounded bg-primary-container/10 px-2 py-0.5 text-[10px] text-primary-container">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {readinessLabel(capability.readiness)} · {capability.tz_mapping}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

type ActiveCameraCardProps = {
  camera: MonitoringCamera | null
  frameKey: number
}

function ActiveCameraCard({ camera, frameKey }: ActiveCameraCardProps) {
  if (camera === null) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-container p-6 text-on-surface-variant">
        Камера не выбрана.
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container">
      <div className="relative aspect-video bg-surface-container-highest">
        <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={camera.name} className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
          FOCUS
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-white">
            {cameraIcon(camera)}
            {camera.name}
          </h3>
          <p className="text-sm text-on-surface-variant">{camera.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <CameraStat label="Source" value={camera.source_type ?? 'mock'} />
          <CameraStat label="AI" value={camera.ai_status} />
          <CameraStat label="FPS" value={camera.fps.toString()} />
          <CameraStat label="Quality" value={qualityLabel(camera.quality_score)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {camera.zones.map((zone) => (
            <span
              key={zone.id}
              className="rounded-full border border-primary-container/30 bg-primary-container/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container"
            >
              {zone.kind} · {zone.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

type TelegramPreviewCardProps = {
  preview: TelegramPreview | null
  busy: boolean
  onTest: () => Promise<void>
}

function TelegramPreviewCard({ preview, busy, onTest }: TelegramPreviewCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-container p-5">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white">
        <Bot size={16} className="text-primary-container" />
        Telegram inline preview
      </h3>
      <div className="mt-4 rounded-lg border border-border-subtle bg-surface-container-lowest p-3 text-on-surface">
        <p className="whitespace-pre-line text-sm leading-6">
          {preview?.text ?? 'Нет события для preview'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(preview?.buttons ?? []).map((button) => (
            <span
              key={button.callback_data}
              className="rounded-lg bg-primary-container px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-primary-container shadow-cyan"
            >
              {button.label}
            </span>
          ))}
        </div>
      </div>
      <button
        disabled={busy}
        onClick={() => void onTest()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-container-low px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-bright disabled:opacity-50"
      >
        <Bell size={14} /> Telegram test
      </button>
    </div>
  )
}

function ReportsCard() {
  const [range, setRange] = useState({ start: '', end: '' })
  const canExportRange = Boolean(range.start && range.end)

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-container p-5">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white">
        <FileText size={16} className="text-primary-container" />
        Отчёты
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">Экспорт отчётов за день или произвольный период.</p>
      <div className="mt-4 grid gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            С даты
            <input
              type="datetime-local"
              value={range.start}
              onChange={(event) => setRange((prev) => ({ ...prev, start: event.target.value }))}
              className="aegis-input mt-1 w-full rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            По дату
            <input
              type="datetime-local"
              value={range.end}
              onChange={(event) => setRange((prev) => ({ ...prev, end: event.target.value }))}
              className="aegis-input mt-1 w-full rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={reportHref('csv', range.start, range.end)}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition active:scale-[0.98] ${
              canExportRange ? 'bg-primary-container text-on-primary-container shadow-cyan' : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
            }`}
            onClick={(event) => {
              if (!canExportRange) event.preventDefault()
            }}
          >
            <Download size={14} /> CSV
          </a>
          <a
            href={reportHref('pdf', range.start, range.end)}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition active:scale-[0.98] ${
              canExportRange ? 'border border-border-subtle bg-surface-container-low text-on-surface' : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
            }`}
            onClick={(event) => {
              if (!canExportRange) event.preventDefault()
            }}
          >
            <Download size={14} /> PDF
          </a>
        </div>
      </div>
    </div>
  )
}

type FilterFieldProps = { label: string; children: ReactNode }
function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

type AnalyticsTileProps = {
  label: string
  value: string | number
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'muted'
}
function AnalyticsTile({ label, value, tone = 'primary' }: AnalyticsTileProps) {
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

type CameraStatProps = { label: string; value: string }
function CameraStat({ label, value }: CameraStatProps) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-container-low px-2 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="truncate text-xs font-medium text-on-surface">{value}</p>
    </div>
  )
}

function HeroSparkArt() {
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a0e18" />
          <stop offset="100%" stopColor="#171b26" />
        </linearGradient>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="360" height="220" fill="url(#bg)" />
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={i}
          x1={20 + i * 18}
          y1={20}
          x2={20 + i * 18}
          y2={200}
          stroke="#3b494c"
          strokeOpacity="0.2"
          strokeDasharray="2 4"
        />
      ))}
      <polyline
        points="20,160 60,150 100,120 140,135 180,90 220,110 260,70 300,85 340,60"
        fill="none"
        stroke="url(#line)"
        strokeWidth="2.5"
      />
      {[
        [180, 90],
        [260, 70],
        [340, 60],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#00e5ff" />
      ))}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#94A3B8">
        <text x="20" y="210">EVENTS</text>
        <text x="180" y="210">TODAY</text>
        <text x="320" y="210">NOW</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#00e5ff">
        <text x="20" y="30">RETAIL CCTV CLUSTER</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#bac9cc">
        <text x="20" y="46">Confidence ranged 0.6 → 0.94 · YOLOv8</text>
      </g>
    </svg>
  )
}

// Force-include side-effect icons to avoid tree-shaking false positives in lint
void SignalHigh
void PlayCircle
void UserCheck
void Activity
void Wifi

export default App
