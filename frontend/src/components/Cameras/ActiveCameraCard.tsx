import type { MonitoringCamera } from '../../types'
import { cameraLiveSrc, cameraStatusDot, qualityLabel } from '../../utils/helpers'
import { cameraIcon } from './cameraIcon'
import { AuthImage } from '../common/AuthImage'

type CameraStatProps = { label: string; value: string }
function CameraStat({ label, value }: CameraStatProps) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-container-low px-2 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="truncate text-xs font-medium text-on-surface">{value}</p>
    </div>
  )
}

type ActiveCameraCardProps = {
  camera: MonitoringCamera | null
  frameKey: number
}

export function ActiveCameraCard({ camera, frameKey }: ActiveCameraCardProps) {
  if (camera === null) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-container p-6 text-on-surface-variant">
        Камера не выбрана
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container">
      <div className="relative aspect-video bg-surface-container-highest">
        <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={camera.name} className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
          ФОКУС
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-white">
            {cameraIcon(camera)}
            {camera.name}
          </h3>
          <p className="text-sm text-on-surface-variant">{camera.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <CameraStat label="Источник" value={camera.source_type ?? 'mock'} />
          <CameraStat label="ИИ" value={camera.ai_status} />
          <CameraStat label="FPS" value={camera.fps.toString()} />
          <CameraStat label="Качество" value={qualityLabel(camera.quality_score)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {camera.zones.map((zone) => (
            <span
              key={zone.id}
              className="rounded-full border border-primary-container/30 bg-primary-container/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container"
            >
              {zone.kind} · {zone.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
