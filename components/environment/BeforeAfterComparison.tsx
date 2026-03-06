'use client'

import { useState } from 'react'

interface Props {
  originalUrl: string
  generatedUrl: string | null
  roomLabel: string
}

export default function BeforeAfterComparison({ originalUrl, generatedUrl, roomLabel }: Props) {
  const [activeView, setActiveView] = useState<'after' | 'before'>('after')
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  if (!generatedUrl) {
    // If no generated image, just show the original
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="relative">
          <img src={originalUrl} alt={`Your ${roomLabel}`} className="w-full h-auto" />
          <div className="absolute top-3 left-3 bg-navy-600/80 text-white text-xs font-medium px-3 py-1 rounded-full">
            Your Room
          </div>
        </div>
        <div className="p-3 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-800">
            The AI-generated Montessori vision could not be created, but your room analysis and recommendations are below.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-1">
        <button
          onClick={() => setActiveView('after')}
          className={`flex-1 py-2 text-sm font-medium transition ${
            activeView === 'after'
              ? 'bg-warm-500 text-white'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          ✨ Montessori Vision
        </button>
        <button
          onClick={() => setActiveView('before')}
          className={`flex-1 py-2 text-sm font-medium transition ${
            activeView === 'before'
              ? 'bg-navy-600 text-white'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          📷 Your Room
        </button>
      </div>

      {/* Image display */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        {/* After (generated) image */}
        <div
          className={`transition-opacity duration-300 ${activeView === 'after' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          onClick={() => setExpandedImage(generatedUrl)}
        >
          <img
            src={generatedUrl}
            alt={`Montessori vision for your ${roomLabel}`}
            className="w-full h-auto cursor-zoom-in"
          />
          <div className="absolute top-3 left-3 bg-warm-500/90 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <span>✨</span> Montessori Vision
          </div>
        </div>

        {/* Before (original) image */}
        <div
          className={`transition-opacity duration-300 ${activeView === 'before' ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          onClick={() => setExpandedImage(originalUrl)}
        >
          <img
            src={originalUrl}
            alt={`Your ${roomLabel}`}
            className="w-full h-auto cursor-zoom-in"
          />
          <div className="absolute top-3 left-3 bg-navy-600/90 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <span>📷</span> Your Room
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-1">Tap image to enlarge</p>

      {/* Lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
          >
            ✕
          </button>
          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-w-full max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
