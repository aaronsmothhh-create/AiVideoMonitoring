import type { ReactNode } from 'react'

type FilterFieldProps = { label: string; children: ReactNode }

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
