export type EventType =
  | 'employee_absence'
  | 'employee_presence'
  | 'visitor_shelf_dwell'
  | 'hand_to_body'
  | 'back_to_camera'
  | 'system_stream_lost'

export type EventStatus = 'new' | 'confirmed' | 'dismissed'
export type Severity = 'low' | 'medium' | 'high'
export type Role = 'admin' | 'operator' | 'manager'
export type Tab = 'overview' | 'events' | 'analytics' | 'cameras' | 'settings'

export type Overview = {
  active_cameras: number
  total_cameras: number
  open_events: number
  confirmed_events: number
  absence_events: number
  suspicious_events: number
  telegram_configured: boolean
}

export type Zone = {
  id: string
  name: string
  kind: 'work_area' | 'shelf' | 'entrance' | 'checkout' | 'stock'
}

export type SourceType =
  | 'demo_video'
  | 'rtsp'
  | 'mock_rtsp'
  | 'public_dataset'
  | 'public_webcam_archive'
  | 'live_mjpeg'
  | 'retail_scene'

export type MonitoringCamera = {
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

export type VideoEvent = {
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

export type ShiftAnalytics = {
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

export type MonitoringSettings = {
  absence_threshold_minutes: number
  shelf_dwell_seconds: number
  confidence_threshold: number
}

export type TelegramButton = {
  label: string
  action: string
  callback_data: string
}

export type TelegramPreview = {
  mode: 'telegram' | 'mock'
  text: string
  buttons: TelegramButton[]
}

export type TelegramTestResponse = {
  configured: boolean
  sent: boolean
  mode: 'telegram' | 'mock'
  detail: string
  inline_feedback: boolean
  preview: TelegramPreview
}

export type User = {
  username: string
  role: Role
}

export type AuthLoginResponse = {
  access_token: string
  token_type: 'bearer'
  expires_at: string
  user: User
}

export type PublicVideoSource = {
  id: string
  title: string
  camera_id: string
  source_url: string
  scenario: string
  license_note: string
  supported_signals: string[]
}

export type DetectionCapability = {
  id: string
  title: string
  readiness: 'demo_ready' | 'heuristic_ready' | 'pilot_needed'
  confidence: number
  what_it_checks: string
  evidence: string[]
  current_limitations: string
  tz_mapping: string
}

export type Filters = {
  cameraId: string
  type: string
  status: string
  dateFrom: string
  dateTo: string
}
