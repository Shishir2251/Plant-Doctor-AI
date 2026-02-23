import { useEffect, useState } from 'react'

const STEPS = [
  { label: 'Uploading plant photo...', icon: '📤' },
  { label: 'Scanning for visual symptoms...', icon: '🔍' },
  { label: 'Identifying plant species...', icon: '🌱' },
  { label: 'Analysing leaf patterns...', icon: '🍃' },
  { label: 'Checking for diseases...', icon: '🧬' },
  { label: 'Generating treatment plan...', icon: '💊' },
  { label: 'Almost done...', icon: '✨' },
]

export default function LoadingPlant({ progress }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  const current = STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Animated plant icon */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-forest-900/80 border-2 border-forest-500/30 flex items-center justify-center">
          <span className="text-5xl animate-bounce">{current.icon}</span>
        </div>

        {/* Orbiting ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-forest-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border border-transparent border-b-forest-700/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

        {/* Pulse glow */}
        <div className="absolute inset-0 rounded-full bg-forest-400/10 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      {/* Step label */}
      <div className="text-center space-y-1">
        <p className="font-display text-lg text-forest-200 font-medium">{current.label}</p>
        <p className="text-forest-500 text-sm font-mono">Powered by Google Gemini Vision</p>
      </div>

      {/* Progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-xs font-mono text-forest-500">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-forest-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-600 to-forest-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step dots */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i <= stepIndex
                ? 'w-6 h-1.5 bg-forest-400'
                : 'w-1.5 h-1.5 bg-forest-800'
            }`}
          />
        ))}
      </div>
    </div>
  )
}