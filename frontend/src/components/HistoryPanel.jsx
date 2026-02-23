import { Clock, CheckCircle, AlertTriangle, HelpCircle, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const STATUS_ICONS = {
  healthy: CheckCircle,
  diseased: AlertTriangle,
  unknown: HelpCircle,
}

const STATUS_COLORS = {
  healthy: 'text-forest-400',
  diseased: 'text-red-400',
  unknown: 'text-amber-400',
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (history.length === 0) return null

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-forest-500" />
          <span className="text-sm font-semibold text-forest-300 font-body">Recent Analyses</span>
        </div>
        <button
          onClick={onClear}
          className="text-forest-600 hover:text-forest-400 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {history.map((item) => {
          const Icon = STATUS_ICONS[item.result.status] || HelpCircle
          const color = STATUS_COLORS[item.result.status] || 'text-forest-500'
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-forest-900 border border-forest-800 flex-shrink-0">
                {item.fileType === 'video'
                  ? <div className="w-full h-full flex items-center justify-center text-lg">🎥</div>
                  : <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-forest-200 text-xs font-medium truncate font-body">
                  {item.result.plant_name || item.filename}
                </p>
                <p className="text-forest-500 text-xs font-mono">{formatTime(item.timestamp)}</p>
              </div>

              <Icon className={clsx('w-4 h-4 flex-shrink-0', color)} />
            </button>
          )
        })}
      </div>
    </div>
  )
}