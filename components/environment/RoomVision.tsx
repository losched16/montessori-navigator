'use client'

import { useState, useEffect, useRef } from 'react'
import BeforeAfterComparison from './BeforeAfterComparison'
import VisionRecommendations from './VisionRecommendations'
import type { RoomType } from '@/lib/environment-guide'

interface VisionResult {
  id: string
  room: string
  age_plane: string | null
  analysis: {
    room_description: string
    current_layout: string[]
    child_height_elements: string[]
    adult_height_elements: string[]
    safety_concerns: string[]
    strengths: string[]
    recommendations: Array<{
      title: string
      description: string
      priority: 'essential' | 'recommended' | 'nice_to_have'
      estimated_cost: 'free' | '$' | '$$' | '$$$'
    }>
    transformation_description: string
  }
  originalImageUrl: string | null
  generatedImageUrl: string | null
  status: string
  created_at: string
}

type VisionState = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error'

const ROOM_LABELS: Record<string, string> = {
  entryway: 'Entryway',
  childs_room: "Child's Room",
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  living_learning: 'Living Room',
  outdoor: 'Outdoor Space',
}

const MAX_VISIONS = 3

// Helpful tips shown during loading
const LOADING_TIPS = [
  'In Montessori, the environment is the "third teacher" — it should invite the child to explore independently.',
  'Child-height furniture is the single most impactful change you can make to any room.',
  'Open shelving with a few well-chosen materials beats a toy box every time.',
  'Natural materials (wood, cotton, metal) engage more senses than plastic.',
  'Rotate materials every 1-2 weeks to maintain interest and prevent overwhelm.',
  'A mirror at child height builds self-awareness and supports language development.',
  'Less is more — 6-8 activities on a shelf is ideal for toddlers.',
]

export default function RoomVision({
  room,
  parentId,
  agePlane,
}: {
  room: RoomType
  parentId: string | null
  agePlane: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<VisionState>('idle')
  const [currentVision, setCurrentVision] = useState<VisionResult | null>(null)
  const [previousVisions, setPreviousVisions] = useState<VisionResult[]>([])
  const [viewingVision, setViewingVision] = useState<VisionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingTip, setLoadingTip] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roomLabel = ROOM_LABELS[room] || 'Room'
  const remaining = Math.max(0, MAX_VISIONS - previousVisions.length)

  // Load existing visions when room changes
  useEffect(() => {
    if (!parentId) return
    setCurrentVision(null)
    setViewingVision(null)
    setState('idle')
    setError(null)
    setPreviewUrl(null)

    const loadVisions = async () => {
      try {
        const res = await fetch('/api/room-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list', room }),
        })
        if (res.ok) {
          const data = await res.json()
          setPreviousVisions(data.visions || [])
        }
      } catch (e) {
        console.error('Failed to load visions:', e)
      }
    }
    loadVisions()
  }, [parentId, room])

  // Cycle loading tips
  useEffect(() => {
    if (state !== 'analyzing' && state !== 'generating') return
    const interval = setInterval(() => {
      setLoadingTip(prev => (prev + 1) % LOADING_TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [state])

  // Simulate progress step transition
  useEffect(() => {
    if (state !== 'analyzing') return
    const timeout = setTimeout(() => {
      if (state === 'analyzing') setState('generating')
    }, 8000)
    return () => clearTimeout(timeout)
  }, [state])

  // Resize image client-side
  const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > height && width > maxSize) {
            height = (height / width) * maxSize
            width = maxSize
          } else if (height > maxSize) {
            width = (width / height) * maxSize
            height = maxSize
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas not supported'))
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.')
      return
    }

    // Validate size (10MB raw, we'll resize)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }

    if (remaining <= 0) {
      setError('You\'ve used all 3 visions for this room.')
      return
    }

    setError(null)
    setState('analyzing')
    setLoadingTip(Math.floor(Math.random() * LOADING_TIPS.length))

    try {
      // Resize image
      const dataUrl = await resizeImage(file, 1024)
      setPreviewUrl(dataUrl)

      const base64Data = dataUrl.split(',')[1]
      // resizeImage always outputs JPEG via canvas.toDataURL, so mediaType is always image/jpeg
      const mediaType = 'image/jpeg'

      // 90-second timeout for the full pipeline (Claude Vision + OpenAI generation)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)

      const response = await fetch('/api/room-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          imageBase64: base64Data,
          mediaType,
          room,
          agePlane,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate vision')
      }

      const data = await response.json()
      setCurrentVision(data.vision)
      setPreviousVisions(prev => [data.vision, ...prev])
      setState('complete')
    } catch (err: any) {
      const msg = err.name === 'AbortError'
        ? 'The request timed out. Please try again with a smaller or simpler photo.'
        : err.message || 'Something went wrong. Please try again.'
      setError(msg)
      setState('error')
    }
  }

  const handleDelete = async (visionId: string) => {
    if (!confirm('Delete this vision? This cannot be undone.')) return
    setDeletingId(visionId)
    try {
      const res = await fetch('/api/room-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', visionId }),
      })
      if (res.ok) {
        setPreviousVisions(prev => prev.filter(v => v.id !== visionId))
        // If we were viewing the deleted one, clear the view
        if (displayVision?.id === visionId) {
          setCurrentVision(null)
          setViewingVision(null)
          setState('idle')
        }
      }
    } catch (e) {
      console.error('Failed to delete vision:', e)
    }
    setDeletingId(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const displayVision = viewingVision || currentVision

  return (
    <div className="mb-6">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-navy-50 to-warm-50 rounded-xl border border-navy-100 hover:border-warm-300 transition group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📸</span>
          <div className="text-left">
            <h3 className="font-semibold text-navy-700 text-sm group-hover:text-warm-700 transition">
              AI Room Vision
            </h3>
            <p className="text-xs text-gray-500">
              Upload a photo — see your Montessori transformation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {previousVisions.length > 0 && (
            <span className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded-full font-medium">
              {previousVisions.length} vision{previousVisions.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="mt-3 space-y-4">
          {/* Upload area (only when idle or error and haven't completed a vision) */}
          {(state === 'idle' || state === 'error') && !displayVision && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-warm-400 rounded-xl p-8 text-center cursor-pointer transition group"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-warm-700">
                  Upload a photo of your {roomLabel.toLowerCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Drag & drop or click to browse · JPG, PNG, WebP · Max 10MB
                </p>
                {remaining < MAX_VISIONS && (
                  <p className="text-xs text-warm-600 mt-2 font-medium">
                    {remaining} vision{remaining !== 1 ? 's' : ''} remaining for this room
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                    e.target.value = '' // Reset so same file can be re-selected
                  }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => { setError(null); setState('idle') }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          )}

          {/* Loading state */}
          {(state === 'analyzing' || state === 'generating') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              {/* Preview of uploaded image */}
              {previewUrl && (
                <div className="mb-4 rounded-lg overflow-hidden max-w-xs mx-auto opacity-50">
                  <img src={previewUrl} alt="Your room" className="w-full h-auto" />
                </div>
              )}

              {/* Progress steps */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`flex items-center gap-2 ${state === 'analyzing' ? 'text-warm-600' : 'text-emerald-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    state === 'analyzing'
                      ? 'bg-warm-100 text-warm-600 animate-pulse'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {state === 'analyzing' ? '1' : '✓'}
                  </div>
                  <span className="text-xs font-medium">Analyze</span>
                </div>

                <div className="w-8 h-px bg-gray-300" />

                <div className={`flex items-center gap-2 ${
                  state === 'generating' ? 'text-warm-600' : 'text-gray-400'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    state === 'generating'
                      ? 'bg-warm-100 text-warm-600 animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="text-xs font-medium">Create Vision</span>
                </div>
              </div>

              <p className="text-sm font-medium text-navy-700 mb-1">
                {state === 'analyzing'
                  ? 'Analyzing your room...'
                  : 'Creating your Montessori vision...'}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {state === 'analyzing'
                  ? 'Our AI is examining your space for layout, accessibility, and safety.'
                  : 'Generating a beautiful Montessori-inspired version of your room.'}
              </p>

              {/* Loading tip */}
              <div className="bg-warm-50 rounded-lg p-3 border border-warm-100 max-w-sm mx-auto">
                <p className="text-xs text-warm-700 italic">
                  💡 {LOADING_TIPS[loadingTip]}
                </p>
              </div>

              <p className="text-[10px] text-gray-300 mt-4">This usually takes 20-40 seconds</p>
            </div>
          )}

          {/* Results */}
          {displayVision && (state === 'complete' || state === 'idle') && (
            <div className="space-y-4">
              {/* Before/After images */}
              {displayVision.originalImageUrl && (
                <BeforeAfterComparison
                  originalUrl={displayVision.originalImageUrl}
                  generatedUrl={displayVision.generatedImageUrl}
                  roomLabel={roomLabel}
                />
              )}

              {/* Recommendations */}
              {displayVision.analysis && (
                <VisionRecommendations
                  recommendations={displayVision.analysis.recommendations || []}
                  strengths={displayVision.analysis.strengths || []}
                  safetyConcerns={displayVision.analysis.safety_concerns || []}
                  roomDescription={displayVision.analysis.room_description || ''}
                />
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {remaining > 0 && (
                  <button
                    onClick={() => {
                      setCurrentVision(null)
                      setViewingVision(null)
                      setPreviewUrl(null)
                      setState('idle')
                    }}
                    className="flex-1 py-2 bg-warm-500 hover:bg-warm-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    📷 Try New Photo
                  </button>
                )}
                {displayVision && (
                  <button
                    onClick={() => handleDelete(displayVision.id)}
                    disabled={deletingId === displayVision.id}
                    className="px-4 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 text-sm font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {deletingId === displayVision.id ? '...' : '🗑 Delete'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Previous visions gallery */}
          {previousVisions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Previous Visions
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {previousVisions.map((v) => (
                  <div key={v.id} className="shrink-0 relative group">
                    <button
                      onClick={() => {
                        setViewingVision(v)
                        setCurrentVision(null)
                        setState('complete')
                      }}
                      className={`rounded-lg overflow-hidden border-2 transition ${
                        displayVision?.id === v.id
                          ? 'border-warm-500 shadow-md'
                          : 'border-gray-200 hover:border-warm-300'
                      }`}
                    >
                      {v.generatedImageUrl ? (
                        <img
                          src={v.generatedImageUrl}
                          alt="Previous vision"
                          className="w-20 h-20 object-cover"
                        />
                      ) : v.originalImageUrl ? (
                        <img
                          src={v.originalImageUrl}
                          alt="Previous upload"
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="px-1.5 py-1 text-center">
                        <p className="text-[9px] text-gray-400">
                          {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </button>
                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 shadow-sm"
                      title="Delete vision"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
