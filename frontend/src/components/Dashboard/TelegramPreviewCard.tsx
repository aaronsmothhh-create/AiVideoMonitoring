import { Bell, Bot } from 'lucide-react'
import type { TelegramPreview } from '../../types'

type TelegramPreviewCardProps = {
  preview: TelegramPreview | null
  busy: boolean
  onTest: () => Promise<void>
}

export function TelegramPreviewCard({ preview, busy, onTest }: TelegramPreviewCardProps) {
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
