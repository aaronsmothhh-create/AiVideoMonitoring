import type { EventType, EventStatus, Role, Tab } from '../types'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  employee_absence: 'Отсутствие сотрудника',
  employee_presence: 'Появление сотрудника',
  visitor_shelf_dwell: 'Долгое нахождение у полки',
  hand_to_body: 'Рука к телу/сумке',
  back_to_camera: 'Спиной к камере',
  system_stream_lost: 'Проблема RTSP',
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  new: 'Новое',
  confirmed: 'Подтверждено',
  dismissed: 'Отклонено',
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Админ',
  operator: 'Оператор',
  manager: 'Руководитель',
}

export const TAB_LABELS: Record<Tab, string> = {
  overview: 'Обзор',
  events: 'События',
  analytics: 'Аналитика',
  cameras: 'Камеры',
  settings: 'Настройки',
}

export const emptyFilters = {
  cameraId: '',
  type: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}
