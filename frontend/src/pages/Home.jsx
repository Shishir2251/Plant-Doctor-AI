import { useState, useEffect } from 'react'
import { RefreshCw, Github, Wifi, WifiOff, Leaf } from 'lucide-react'
import { useAnalysis } from '../hooks/useAnalysis'
import UploadZone from '../components/UploadZone'
import ResultCard from '../components/ResultCard'
import LoadingPlant from '../components/LoadingPlant'
import HistoryPanel from '../components/HistoryPanel'
import { checkHealth } from '../utils/api'
import clsx from 'clsx'

export default function Home() {
  const {
    isLoading, result, error, uploadProgress, previewUrl, fileType,
    history, analyse, reset, loadFromHistory
  } = useAnalysis()

  const [backendOk, setBackendOk] = useState(null)
  const [historyItems, setHistoryItems] = useState([])

  // Sync history
  useEffect(() => { setHistoryItems(history) }, [history])

  // Check backend on mount
  useEffect(() => {
    checkHealth()
      .then(d => setBackendOk(d.gemini_api_configured))
      .catch(() => setBackendOk(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-forest-900/80 backdrop-blur-sm sticky top-0 z-50 bg-forest-950/90">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-500/20 border border-forest-500/30 flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-forest-100 text-lg leading-none">Plant Doctor</h1>
              <p className="text-forest-500 text-xs font-mono">AI-powered plant health analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend status */}
            <div className={clsx(
              'hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border',
              backendOk === null ? 'text-forest-500 border-forest-800' :
              backendOk ? 'text-forest-400 border-forest-700 bg-forest-500/10' :
              'text-red-400 border-red-800 bg-red-500/10'
            )}>
              {backendOk === null ? <Leaf className="w-3 h-3 animate-pulse" /> :
               backendOk ? <Wifi className="w-3 h-3" /> :
               <WifiOff className="w-3 h-3" />
              }
              {backendOk === null ? 'Connecting...' :
               backendOk ? 'AI Ready' : 'API Not Configured'}
            </div>

            {result && (
              <button onClick={reset} className="btn-ghost flex items-center gap-1.5 text-sm">
                <RefreshCw className="w-3.5 h-3.5" />
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero tagline */}
      {!result && !isLoading && (
        <div className="max-w-2xl mx-auto text-center px-4 pt-16 pb-10">
          <div className="inline-flex items-center gap-2 bg-forest-900/60 border border-forest-700/50 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-mono text-forest-400">Powered by Google Gemini Vision AI</span>
            <span className="text-forest-600">·</span>
            <span className="text-xs font-mono text-forest-500">Free</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient leading-tight mb-4">
            Is your plant<br />feeling unwell?
          </h2>
          <p className="text-forest-400 text-lg font-body leading-relaxed">
            Upload a photo or video of your plant and our AI will diagnose any issues, explain why they're happening, and prescribe a treatment plan.
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-16">
        {!result && !isLoading && (
          <div className="max-w-xl mx-auto space-y-4">
            {/* API warning */}
            {backendOk === false && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-300 mb-1">⚠️ Backend not configured</p>
                <p className="text-amber-400 text-xs font-body">
                  Make sure your backend is running and <code className="font-mono bg-black/30 px-1 rounded">GEMINI_API_KEY</code> is set in <code className="font-mono bg-black/30 px-1 rounded">backend/.env</code>
                </p>
              </div>
            )}

            <UploadZone onFile={analyse} isLoading={isLoading} />

            <HistoryPanel
              history={historyItems}
              onSelect={loadFromHistory}
              onClear={() => setHistoryItems([])}
            />
          </div>
        )}

        {isLoading && (
          <div className="max-w-xl mx-auto glass-card">
            <LoadingPlant progress={uploadProgress} />
          </div>
        )}

        {(result || error) && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
            {/* Left: preview + history */}
            <div className="lg:col-span-4 space-y-4">
              {/* Image preview */}
              {previewUrl && (
                <div className="glass-card overflow-hidden">
                  {fileType === 'video'
                    ? (
                      <div className="aspect-video bg-forest-900 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="text-4xl">🎥</div>
                          <p className="text-forest-400 text-sm font-body">Video — Best frame analysed</p>
                        </div>
                      </div>
                    )
                    : (
                      <img
                        src={previewUrl}
                        alt="Analysed plant"
                        className="w-full object-cover max-h-64 lg:max-h-96"
                      />
                    )
                  }
                  <div className="p-3 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs font-mono text-forest-500">Analysed plant</p>
                    <button
                      onClick={reset}
                      className="text-xs font-mono text-forest-400 hover:text-forest-200 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      New scan
                    </button>
                  </div>
                </div>
              )}

              {/* History sidebar */}
              <HistoryPanel
                history={historyItems}
                onSelect={(item) => {
                  loadFromHistory(item)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onClear={() => setHistoryItems([])}
              />
            </div>

            {/* Right: results */}
            <div className="lg:col-span-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-3">
                  <p className="font-display text-xl font-semibold text-red-300">Analysis Failed</p>
                  <p className="text-red-400 font-body text-sm">{error}</p>
                  <button onClick={reset} className="btn-ghost text-sm">
                    Try Again
                  </button>
                </div>
              )}

              {result && (
                <ResultCard result={result} previewUrl={previewUrl} fileType={fileType} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-forest-900/60 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-forest-600 text-xs font-mono">
            🌿 Plant Doctor AI — Demo Version — Free tier via Google Gemini
          </p>
          <p className="text-forest-700 text-xs font-mono">
            Results are AI-generated and for informational purposes only
          </p>
        </div>
      </footer>
    </div>
  )
}