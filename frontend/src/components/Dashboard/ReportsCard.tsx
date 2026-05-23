import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { reportHref } from '../../utils/helpers'

export function ReportsCard() {
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
