import { CheckCircle, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Leaf, Stethoscope, FlaskConical, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-forest-400',
    bg: 'bg-forest-500/10',
    border: 'border-forest-500/30',
    badge: 'status-healthy',
    label: '✅ Healthy',
    glow: 'glow-green',
    emoji: '🌿',
  },
  diseased: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'status-diseased',
    label: '⚠️ Issue Detected',
    glow: 'glow-red',
    emoji: '🔬',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'status-unknown',
    label: '❓ Unknown',
    glow: '',
    emoji: '🤔',
  },
}

function Section({ icon: Icon, title, children, defaultOpen = true, color = 'text-forest-400' }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="font-semibold text-forest-100 font-body">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-forest-500" /> : <ChevronDown className="w-4 h-4 text-forest-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  )
}

function BulletList({ items, color = 'bg-forest-500' }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
          <p className="text-forest-200 text-sm leading-relaxed font-body">{item}</p>
        </li>
      ))}
    </ul>
  )
}

function NumberedList({ items }) {
  return (
    <ol className="mt-3 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest-800 border border-forest-600 flex items-center justify-center text-xs font-mono text-forest-300 font-semibold">
            {i + 1}
          </span>
          <p className="text-forest-200 text-sm leading-relaxed font-body pt-0.5">{item}</p>
        </li>
      ))}
    </ol>
  )
}

export default function ResultCard({ result, previewUrl, fileType }) {
  const cfg = statusConfig[result.status] || statusConfig.unknown
  const StatusIcon = cfg.icon

  return (
    <div className="result-enter space-y-4">
      {/* Header card */}
      <div className={clsx('rounded-2xl border p-6', cfg.bg, cfg.border, cfg.glow)}>
        <div className="flex items-start gap-4">
          {/* Plant preview */}
          {previewUrl && (
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10">
              {fileType === 'video'
                ? <div className="w-full h-full bg-forest-900 flex items-center justify-center text-2xl">🎥</div>
                : <img src={previewUrl} alt="Plant" className="w-full h-full object-cover" />
              }
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx('text-xs font-mono font-semibold px-2.5 py-1 rounded-full border', cfg.badge)}>
                {cfg.label}
              </span>
              {result.confidence && (
                <span className="text-xs font-mono text-forest-500 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                  {result.confidence} confidence
                </span>
              )}
            </div>

            {result.plant_name && (
              <p className="font-display text-xl font-semibold text-forest-100 mt-2">
                {result.plant_name}
              </p>
            )}

            <p className="text-forest-300 text-sm mt-2 leading-relaxed font-body">
              {result.summary}
            </p>
          </div>

          <StatusIcon className={`w-8 h-8 flex-shrink-0 ${cfg.color}`} />
        </div>
      </div>

      {/* Healthy message */}
      {result.is_healthy && (
        <div className="glass-card p-6 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <p className="font-display text-lg font-semibold text-forest-200">Your plant is thriving!</p>
          <p className="text-forest-400 text-sm font-body">No diseases or issues were detected. Keep up the great plant care!</p>
          {result.additional_tips && (
            <p className="text-forest-300 text-sm mt-3 italic font-body border-t border-white/5 pt-3">
              💡 {result.additional_tips}
            </p>
          )}
        </div>
      )}

      {/* Diseased sections */}
      {!result.is_healthy && result.problems?.length > 0 && (
        <>
          <Section icon={Stethoscope} title="Problems Detected" defaultOpen={true} color="text-red-400">
            <BulletList items={result.problems} color="bg-red-500" />
          </Section>

          {result.reasons?.length > 0 && (
            <Section icon={FlaskConical} title="Why We Detected This" defaultOpen={true} color="text-amber-400">
              <p className="text-forest-500 text-xs font-mono mt-3 mb-1">Visual evidence observed in your plant:</p>
              <BulletList items={result.reasons} color="bg-amber-500" />
            </Section>
          )}

          {result.solutions?.length > 0 && (
            <Section icon={Leaf} title="Treatment & Solutions" defaultOpen={true} color="text-forest-400">
              <p className="text-forest-500 text-xs font-mono mt-3 mb-1">Follow these steps in order:</p>
              <NumberedList items={result.solutions} />
            </Section>
          )}

          {result.additional_tips && (
            <Section icon={Lightbulb} title="Additional Tips" defaultOpen={false} color="text-sky-400">
              <p className="text-forest-300 text-sm leading-relaxed mt-3 font-body">{result.additional_tips}</p>
            </Section>
          )}
        </>
      )}
    </div>
  )
}