'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { InspirationPhoto } from '@/lib/environment-guide'

export default function InspirationPhotos({ photos }: { photos: InspirationPhoto[] }) {
  const [expandedPhoto, setExpandedPhoto] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📸</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Inspiration Gallery</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => setExpandedPhoto(expandedPhoto === i ? null : i)}
            className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition text-left"
          >
            <div className="relative w-full pb-[75%]">
              <img
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="p-2.5">
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{photo.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded photo lightbox */}
      {expandedPhoto !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[expandedPhoto].src}
              alt={photos[expandedPhoto].alt}
              className="w-full h-auto max-h-[70vh] object-contain bg-gray-50"
            />
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{photos[expandedPhoto].caption}</p>
            </div>
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition"
            >
              ✕
            </button>
            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedPhoto((expandedPhoto - 1 + photos.length) % photos.length) }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-lg transition"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedPhoto((expandedPhoto + 1) % photos.length) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-lg transition"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
