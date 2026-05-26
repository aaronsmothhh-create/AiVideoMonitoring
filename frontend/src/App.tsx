import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

import type {
  DetectionCapability, EventStatus, Filters, MonitoringCamera,
  MonitoringSettings, Overview, PublicVideoSource, Role, ShiftAnalytics,
  Tab, TelegramPreview, TelegramTestResponse, VideoEvent,
} from './types'
import { fetchJson } from './api/client'
import { emptyFilters } from './constants'
import { buildEventQuery } from './utils/helpers'

import { LoginForm } from './components/Auth/LoginForm'
import { Sidebar } from './components/Layout/Sidebar'
import { Header } from './components/Layout/Header'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { DashboardSkeleton } from './components/common/LoadingSkeleton'

import { OverviewPage } from './pages/OverviewPage'
import { EventsPage } from './pages/EventsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CamerasPage } from './pages/CamerasPage'
import { SettingsPage } from './pages/SettingsPage'

const TAB_ROUTES: Record<Tab, string> = {
  overview: '/',
  events: '/events',
  analytics: '/analytics',
  cameras: '/cameras',
  settings: '/settings',
}

const ROUTE_TO_TAB: Record<string, Tab> = {
  '/': 'overview',
  '/events': 'events',
  '/analytics': 'analytics',
  '/cameras': 'cameras',
  '/settings': 'settings',
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState(localStorage.getItem('AegisAuthToken') ?? '')
  const [role, setRole] = useState<Role>((localStorage.getItem('AegisRole') as Role) || 'operator')
  const [cameras, setCameras] = useState<MonitoringCamera[]>([])
  const [events, setEvents] = useState<VideoEvent[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [analytics, setAnalytics] = useState<ShiftAnalytics | null>(null)
  const [settings, setSettings] = useState<MonitoringSettings | null>(null)
  const [telegramPreview, setTelegramPreview] = useState<TelegramPreview | null>(null)
  const [capabilities, setCapabilities] = useState<DetectionCapability[]>([])
  const [publicSources, setPublicSources] = useState<PublicVideoSource[]>([])
  const [busy, setBusy] = useState(false)
  const [frameKey, setFrameKey] = useState(0)
  const [activeCamera, setActiveCamera] = useState<MonitoringCamera | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const activeTab: Tab = ROUTE_TO_TAB[location.pathname] ?? 'overview'

  const handleLogin = useCallback((newToken: string, newRole: Role) => {
    setToken(newToken)
    setRole(newRole)
    localStorage.setItem('AegisAuthToken', newToken)
    localStorage.setItem('AegisRole', newRole)
  }, [])

  const handleLogout = useCallback(() => {
    setToken('')
    localStorage.removeItem('AegisAuthToken')
    localStorage.removeItem('AegisRole')
  }, [])

  const handleTabChange = useCallback((tab: Tab) => {
    navigate(TAB_ROUTES[tab])
  }, [navigate])

  const loadData = useCallback(async () => {
    if (!token) return
    try {
      const [cams, evts, ov, ana, sett, caps, pubs] = await Promise.all([
        fetchJson<MonitoringCamera[]>('/api/cameras'),
        fetchJson<VideoEvent[]>('/api/events'),
        fetchJson<Overview>('/api/overview'),
        fetchJson<ShiftAnalytics>('/api/shift/analytics'),
        fetchJson<MonitoringSettings>('/api/settings'),
        fetchJson<DetectionCapability[]>('/api/capabilities'),
        fetchJson<PublicVideoSource[]>('/api/sources/public'),
      ])
      setCameras(cams)
      setEvents(evts)
      setOverview(ov)
      setAnalytics(ana)
      setSettings(sett)
      setCapabilities(caps)
      setPublicSources(pubs)
      if (!activeCamera && cams.length > 0) setActiveCamera(cams[0])
    } catch {
      /* ignore first-load race */
    } finally {
      setInitialLoading(false)
    }
  }, [token, activeCamera])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (!token) return
    const id = setInterval(() => setFrameKey((prev) => prev + 1), 1500)
    return () => clearInterval(id)
  }, [token])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const tabs: Tab[] = ['overview', 'events', 'analytics', 'cameras', 'settings']
      if (e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        handleTabChange(tabs[Number(e.key) - 1])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTabChange])

  const handleSimulate = useCallback(async () => {
    setBusy(true)
    try {
      await fetchJson('/api/events/simulate', { method: 'POST' })
      const evts = await fetchJson<VideoEvent[]>('/api/events')
      setEvents(evts)
    } catch { /* ignore */ }
    setBusy(false)
  }, [])

  const handleFeedback = useCallback(async (eventId: string, status: EventStatus) => {
    setBusy(true)
    try {
      await fetchJson(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ status, note: '', reviewed_by: role }),
      })
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, status } : ev))
      )
    } catch { /* ignore */ }
    setBusy(false)
  }, [role])

  const handleApplyFilters = useCallback(async () => {
    setBusy(true)
    try {
      const evts = await fetchJson<VideoEvent[]>(buildEventQuery(filters))
      setEvents(evts)
    } catch { /* ignore */ }
    setBusy(false)
  }, [filters])

  const handleResetFilters = useCallback(async () => {
    setFilters(emptyFilters)
    setBusy(true)
    try {
      const evts = await fetchJson<VideoEvent[]>('/api/events')
      setEvents(evts)
    } catch { /* ignore */ }
    setBusy(false)
  }, [])

  const handleSaveSettings = useCallback(async () => {
    if (!settings) return
    setBusy(true)
    try {
      await fetchJson('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
    } catch { /* ignore */ }
    setBusy(false)
  }, [settings])

  const handleTelegramTest = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetchJson<TelegramTestResponse>('/api/telegram/test', { method: 'POST' })
      setTelegramPreview(res.preview)
    } catch { /* ignore */ }
    setBusy(false)
  }, [])

  const onlineCameraCount = useMemo(
    () => cameras.filter((c) => c.status === 'online').length,
    [cameras]
  )
  const aiAccuracy = useMemo(() => {
    if (events.length === 0) return 0
    return Math.round(
      (events.reduce((sum, e) => sum + e.confidence, 0) / events.length) * 100
    )
  }, [events])
  const suspiciousRate = useMemo(() => {
    if (events.length === 0) return 0
    const suspicious = events.filter((e) => e.severity === 'high').length
    return Math.round((suspicious / events.length) * 100)
  }, [events])
  const eventTrend = useMemo(() => {
    const buckets = 20
    const trend = Array<number>(buckets).fill(0)
    if (events.length === 0) return trend
    const now = Date.now()
    events.forEach((e) => {
      const age = now - new Date(e.detected_at).getTime()
      const idx = Math.min(buckets - 1, Math.floor(age / (7_200_000 / buckets)))
      trend[buckets - 1 - idx] += 1
    })
    const max = Math.max(...trend, 1)
    return trend.map((v) => v / max)
  }, [events])

  const filteredCameras = useMemo(
    () => cameras.filter((c) => c.source_type === 'retail_scene' || c.source_type === 'live_mjpeg' || c.source_type === 'video_file'),
    [cameras]
  )

  if (!token) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden w-64 md:block" />
        <main className="flex-1 p-6 md:ml-64">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        role={role}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-h-screen flex-1 flex-col pb-20 md:ml-64 md:pb-0">
        <Header
          activeTab={activeTab}
          busy={busy}
          onSimulate={handleSimulate}
          onMobileMenuOpen={() => setSidebarOpen(true)}
        />

        <div className="flex-1 space-y-6 p-4 md:p-8">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <OverviewPage
                  overview={overview}
                  analytics={analytics}
                  onlineCameraCount={onlineCameraCount}
                  aiAccuracy={aiAccuracy}
                  suspiciousRate={suspiciousRate}
                  cameras={cameras}
                  activeCamera={activeCamera}
                  onSelectCamera={(id) => setActiveCamera(cameras.find((c) => c.id === id) ?? null)}
                  events={events.slice(0, 6)}
                  eventTrend={eventTrend}
                  frameKey={frameKey}
                  role={role}
                  busy={busy}
                  onFeedback={handleFeedback}
                  telegramPreview={telegramPreview}
                  onTelegramTest={handleTelegramTest}
                  capabilities={capabilities}
                />
              } />
              <Route path="/events" element={
                <EventsPage
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
              } />
              <Route path="/analytics" element={
                analytics ? (
                  <AnalyticsPage
                    analytics={analytics}
                    eventTrend={eventTrend}
                    telegramPreview={telegramPreview}
                    busy={busy}
                    onTelegramTest={handleTelegramTest}
                  />
                ) : null
              } />
              <Route path="/cameras" element={
                <CamerasPage
                  cameras={filteredCameras}
                  publicSources={publicSources}
                  frameKey={frameKey}
                />
              } />
              <Route path="/settings" element={
                settings ? (
                  <SettingsPage
                    settings={settings}
                    role={role}
                    busy={busy}
                    onChange={setSettings}
                    onSave={handleSaveSettings}
                    capabilities={capabilities}
                  />
                ) : null
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
