import type { ReactNode } from 'react'
import { BarChart3, Download, HelpCircle, LayoutDashboard, LogOut, Settings, ShieldAlert, Video, X } from 'lucide-react'
import type { Role, Tab } from '../../types'
import { ROLE_LABELS, TAB_LABELS } from '../../constants'
import { reportHref } from '../../utils/helpers'

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: 'overview', label: TAB_LABELS.overview, icon: <LayoutDashboard size={18} /> },
  { id: 'events', label: TAB_LABELS.events, icon: <ShieldAlert size={18} /> },
  { id: 'analytics', label: TAB_LABELS.analytics, icon: <BarChart3 size={18} /> },
  { id: 'cameras', label: TAB_LABELS.cameras, icon: <Video size={18} /> },
  { id: 'settings', label: TAB_LABELS.settings, icon: <Settings size={18} /> },
]

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  role: Role
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout, role, isMobileOpen, onMobileClose }: SidebarProps) {
  const navContent = (
    <div className="flex h-full flex-col p-6">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/20 text-primary-container shadow-cyan">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="text-headline-md font-bold text-primary">Aegis AI</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              ИИ-мониторинг активен
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
              onClick={() => {
                onTabChange(item.id)
                onMobileClose()
              }}
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
        <div className="mb-3 rounded-lg bg-surface-container-low p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Роль</p>
          <p className="text-sm font-semibold text-white">{ROLE_LABELS[role]}</p>
        </div>
        <a
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary transition active:scale-[0.98]"
          href={reportHref('pdf')}
          target="_blank"
          rel="noreferrer"
        >
          <Download size={16} /> Экспорт отчётов
        </a>
        <button className="flex w-full items-center gap-4 rounded-lg p-3 text-left text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface">
          <HelpCircle size={18} />
          <span className="text-[12px] font-bold uppercase tracking-widest">Помощь</span>
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-4 rounded-lg p-3 text-left text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
        >
          <LogOut size={18} />
          <span className="text-[12px] font-bold uppercase tracking-widest">Выход</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border-subtle bg-surface-container md:flex">
        {navContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-screen w-64 border-r border-border-subtle bg-surface-container shadow-lg">
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-3 rounded-full p-2 text-on-surface-variant hover:bg-surface-bright"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border-subtle bg-surface-base px-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
    </>
  )
}
