import { useState, useCallback } from 'react'
import { analyseImage, analyseVideo } from '../utils/api'
import toast from 'react-hot-toast'

export const useAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [history, setHistory] = useState([])

  const analyse = useCallback(async (file) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setUploadProgress(0)

    // Generate preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const isVideo = file.type.startsWith('video/')
    setFileType(isVideo ? 'video' : 'image')

    try {
      const analyser = isVideo ? analyseVideo : analyseImage
      const data = await analyser(file, setUploadProgress)

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data.result)

      // Add to history
      const historyItem = {
        id: Date.now(),
        filename: file.name,
        previewUrl: url,
        result: data.result,
        timestamp: new Date().toISOString(),
        fileType: isVideo ? 'video' : 'image',
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // keep last 10

      if (data.result.is_healthy) {
        toast.success('Plant looks healthy! 🌿')
      } else {
        toast.error('Issues detected — check the diagnosis below.')
      }

    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Something went wrong'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setPreviewUrl(null)
    setFileType(null)
    setUploadProgress(0)
  }, [])

  const loadFromHistory = useCallback((historyItem) => {
    setPreviewUrl(historyItem.previewUrl)
    setResult(historyItem.result)
    setFileType(historyItem.fileType)
    setError(null)
  }, [])

  return {
    isLoading,
    result,
    error,
    uploadProgress,
    previewUrl,
    fileType,
    history,
    analyse,
    reset,
    loadFromHistory,
  }
}