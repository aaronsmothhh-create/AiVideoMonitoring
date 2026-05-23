type CameraStatProps = { label: string; value: string }

export function CameraStat({ label, value }: CameraStatProps) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-container-low px-2 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="truncate text-xs font-medium text-on-surface">{value}</p>
    </div>
  )
}
