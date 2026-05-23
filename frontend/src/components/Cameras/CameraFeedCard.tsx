import type { MonitoringCamera } from '../../types'
import { cameraLiveSrc, cameraStatusDot, qualityLabel } from '../../utils/helpers'
import { cameraIcon } from './cameraIcon'
import { AuthImage } from '../common/AuthImage'

type CameraFeedCardProps = {
  camera: MonitoringCamera
  frameKey: number
  active: boolean
  onClick: () => void
}

export function CameraFeedCard({ camera, frameKey, active, onClick }: CameraFeedCardProps) {
  return (
    <button
      onClick={onClick}
      className={`camera-feed group relative aspect-video w-full overflow-hidden rounded-lg border bg-surface-container-highest text-left transition ${
        active
          ? 'border-primary-container glow-cyan'
          : 'border-border-subtle hover:border-primary-container/60'
      }`}
    >
      <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={camera.name} className={`h-full w-full object-cover transition ${active ? '' : 'opacity-85 group-hover:opacity-100'}`} />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
        LIVE
      </div>
      <div className="camera-meta absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-black/60 p-3 opacity-0 transition-opacity backdrop-blur-md">
        <div>
          <p className="font-mono text-[12px] font-medium text-white">{camera.name.toUpperCase()}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            FPS {camera.fps} · Quality {qualityLabel(camera.quality_score)}
          </p>
        </div>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
          active ? 'text-primary-container' : 'text-on-surface-variant'
        }`}>
          {cameraIcon(camera)}
        </span>
      </div>
    </button>
  )
}
