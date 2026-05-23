import { Cpu } from 'lucide-react'
import type { DetectionCapability } from '../../types'

function readinessLabel(readiness: DetectionCapability['readiness']) {
  if (readiness === 'demo_ready') return 'Demo-ready'
  if (readiness === 'heuristic_ready') return 'Heuristic ready'
  return 'Pilot needed'
}

type CapabilityCardProps = { capabilities: DetectionCapability[] }

export function CapabilityCard({ capabilities }: CapabilityCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-container p-6">
      <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-white">
        <Cpu size={16} className="text-primary-container" />
        Detection capabilities
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Что уже умеем выявлять, какие признаки используем и где честные ограничения MVP.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {capabilities.map((capability) => (
          <article
            key={capability.id}
            className="flex flex-col rounded-lg border border-border-subtle bg-surface-container-low p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">{capability.title}</h4>
              <span className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                {Math.round(capability.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{capability.what_it_checks}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {capability.evidence.slice(0, 4).map((item) => (
                <span key={item} className="rounded bg-primary-container/10 px-2 py-0.5 text-[10px] text-primary-container">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {readinessLabel(capability.readiness)} · {capability.tz_mapping}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
