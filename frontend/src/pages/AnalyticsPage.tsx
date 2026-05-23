import type { ShiftAnalytics, TelegramPreview } from '../types'
import { AnalyticsTile } from '../components/Dashboard/AnalyticsTile'
import { TrendCard } from '../components/Dashboard/TrendCard'
import { TelegramPreviewCard } from '../components/Dashboard/TelegramPreviewCard'
import { ReportsCard } from '../components/Dashboard/ReportsCard'
import { formatSeconds } from '../utils/helpers'

type AnalyticsPageProps = {
  analytics: ShiftAnalytics
  eventTrend: number[]
  telegramPreview: TelegramPreview | null
  busy: boolean
  onTelegramTest: () => Promise<void>
}

export function AnalyticsPage({ analytics, eventTrend, telegramPreview, busy, onTelegramTest }: AnalyticsPageProps) {
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
