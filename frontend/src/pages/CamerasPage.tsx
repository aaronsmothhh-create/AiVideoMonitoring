import type { MonitoringCamera, PublicVideoSource } from '../types'
import { cameraLiveSrc, cameraStatusDot, qualityLabel, formatSeconds, timeAgo } from '../utils/helpers'
import { cameraIcon } from '../components/Cameras/cameraIcon'
import { CameraStat } from '../components/Cameras/CameraStat'
import { AuthImage } from '../components/common/AuthImage'

type CamerasPageProps = {
  cameras: MonitoringCamera[]
  publicSources: PublicVideoSource[]
  frameKey: number
}

export function CamerasPage({ cameras, publicSources, frameKey }: CamerasPageProps) {
  return (
    <section className="space-y-6">
      <div className="bento-grid">
        {cameras.map((camera) => (
          <article
            key={camera.id}
            className="col-span-12 overflow-hidden rounded-xl border border-border-subtle bg-surface-container transition hover:border-primary-container/60 md:col-span-6 xl:col-span-4"
          >
            <div className="relative aspect-video bg-surface-container-highest">
              <AuthImage src={cameraLiveSrc(camera, frameKey)} alt={`Live ${camera.name}`} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusDot(camera.status)}`} />
                {camera.status}
              </div>
              <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container backdrop-blur-md">
                {camera.source_type === 'retail_scene'
                  ? 'Синтетическая'
                  : camera.source_type === 'live_mjpeg'
                  ? 'Живой MJPEG'
                  : camera.source_type === 'video_file'
                  ? 'Видеопоток'
                  : camera.source_type ?? '—'}
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
                <CameraStat label="Статус" value={camera.status} />
                <CameraStat label="ИИ" value={camera.ai_status} />
                <CameraStat label="FPS" value={camera.fps.toString()} />
                <CameraStat label="Качество" value={qualityLabel(camera.quality_score)} />
                <CameraStat label="Аптайм" value={formatSeconds((camera.uptime_minutes ?? 0) * 60)} />
                <CameraStat label="Посл. кадр" value={timeAgo(camera.last_seen_at)} />
              </div>

              <div className="rounded-lg border border-border-subtle bg-surface-container-low p-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Источник</p>
                <p className="break-all font-mono text-xs text-on-surface">{camera.rtsp_url}</p>
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
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
        <h3 className="mb-4 text-[12px] font-bold uppercase tracking-widest text-white">
          Источники видео
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {publicSources.map((source) => (
            <a
              key={source.id}
              href={source.source_url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-border-subtle bg-surface-container-low p-3 transition hover:border-primary-container/40 hover:bg-surface-bright"
            >
              <span className="text-sm font-semibold text-white">{source.title}</span>
              <p className="mt-1 text-xs text-on-surface-variant">{source.scenario}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {source.supported_signals.map((sig) => (
                  <span key={sig} className="rounded bg-primary-container/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                    {sig}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
