'use client'

import { useState } from 'react'
import YouTubeEmbed from '@/components/youtube-embed'
import type { InspirationVideo } from '@/lib/environment-guide'

export default function InspirationVideos({ videos }: { videos: InspirationVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  if (videos.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎬</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Inspiration Videos</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(video => (
          <div key={video.videoId} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {activeVideo === video.videoId ? (
              <YouTubeEmbed videoId={video.videoId} title={video.title} />
            ) : (
              <button
                onClick={() => setActiveVideo(video.videoId)}
                className="relative w-full pb-[56.25%] bg-gray-100"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
              </button>
            )}
            <div className="p-3">
              <h4 className="text-sm font-medium text-navy-600 leading-snug">{video.title}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
