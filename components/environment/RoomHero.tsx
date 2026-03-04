'use client'

import type { RoomGuide } from '@/lib/environment-guide'

export default function RoomHero({ guide }: { guide: RoomGuide }) {
  return (
    <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white mb-6">
      <div className="text-4xl mb-3">{guide.heroEmoji}</div>
      <h2 className="text-xl sm:text-2xl font-bold mb-1">{guide.label}</h2>
      <p className="text-teal-100 text-sm italic mb-4">{guide.tagline}</p>
      <p className="text-white/80 text-sm leading-relaxed mb-5">{guide.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {guide.designPrinciples.map((p, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <span className="text-xl">{p.icon}</span>
            <div className="text-sm font-semibold mt-1">{p.title}</div>
            <div className="text-xs text-white/70 mt-0.5 leading-relaxed">{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
