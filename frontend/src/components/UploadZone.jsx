import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, Video, Leaf } from 'lucide-react'
import clsx from 'clsx'

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/avi': ['.avi'],
  'video/webm': ['.webm'],
}

export default function UploadZone({ onFile, isLoading }) {
  const [dragOver, setDragOver] = useState(false)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isLoading,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDropAccepted: () => setDragOver(false),
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={clsx(
          'relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12',
          'flex flex-col items-center justify-center gap-5 min-h-[320px]',
          isDragActive || dragOver
            ? 'border-forest-400 bg-forest-500/10 dropzone-active'
            : 'border-forest-700/50 hover:border-forest-500/70 bg-forest-950/50 hover:bg-forest-500/5',
          isLoading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />

        {/* Decorative corner leaves */}
        <div className="absolute top-3 left-3 text-forest-700/40 text-xl">🌿</div>
        <div className="absolute top-3 right-3 text-forest-700/40 text-xl rotate-90">🌿</div>
        <div className="absolute bottom-3 left-3 text-forest-700/40 text-xl -rotate-90">🌿</div>
        <div className="absolute bottom-3 right-3 text-forest-700/40 text-xl rotate-180">🌿</div>

        {/* Icon */}
        <div className={clsx(
          'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
          isDragActive
            ? 'bg-forest-500/30 scale-110'
            : 'bg-forest-900/80 group-hover:bg-forest-800/80'
        )}>
          {isDragActive
            ? <Leaf className="w-10 h-10 text-forest-300 animate-bounce" />
            : <Upload className="w-10 h-10 text-forest-400 group-hover:text-forest-300 transition-colors" />
          }
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="font-display text-xl font-semibold text-forest-100">
            {isDragActive ? 'Drop your plant here' : 'Upload your plant'}
          </p>
          <p className="text-forest-400 text-sm font-body">
            Drag & drop or click to browse
          </p>
        </div>

        {/* Format badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="flex items-center gap-1.5 bg-forest-900/60 border border-forest-700/50 rounded-full px-3 py-1">
            <Camera className="w-3.5 h-3.5 text-forest-400" />
            <span className="text-xs text-forest-300 font-mono">JPG, PNG, WebP</span>
          </div>
          <div className="flex items-center gap-1.5 bg-forest-900/60 border border-forest-700/50 rounded-full px-3 py-1">
            <Video className="w-3.5 h-3.5 text-forest-400" />
            <span className="text-xs text-forest-300 font-mono">MP4, MOV, WebM</span>
          </div>
        </div>

        <p className="text-forest-600 text-xs font-mono">Max 20MB</p>
      </div>

      {/* Or divider + click button */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-forest-800" />
        <span className="text-forest-600 text-xs font-mono">or</span>
        <div className="flex-1 h-px bg-forest-800" />
      </div>

      <button
        onClick={open}
        disabled={isLoading}
        className="mt-3 w-full btn-primary flex items-center justify-center gap-2"
      >
        <Camera className="w-4 h-4" />
        Choose File
      </button>
    </div>
  )
}