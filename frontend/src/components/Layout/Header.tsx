import { Menu, Search, Zap } from 'lucide-react'
import type { Tab } from '../../types'
import { TAB_LABELS } from '../../constants'

type HeaderProps = {
  activeTab: Tab
  busy: boolean
  onSimulate: () => Promise<void>
  onMobileMenuOpen: () => void
}

export function Header({ activeTab, busy, onSimulate, onMobileMenuOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-base/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuOpen}
          className="rounded p-1 text-on-surface-variant md:hidden"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
          {TAB_LABELS[activeTab]}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-bright">
          <Search size={18} />
        </button>
        <button
          onClick={() => void onSimulate()}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-status-danger/20 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-status-danger transition hover:bg-status-danger/30 disabled:opacity-50"
        >
          <Zap size={14} /> Симулировать событие
        </button>
      </div>
    </header>
  )
}
