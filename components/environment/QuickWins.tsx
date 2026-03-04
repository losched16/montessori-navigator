'use client'

export default function QuickWins({ wins }: { wins: string[] }) {
  if (wins.length === 0) return null
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Quick Wins — Do Today</h3>
      </div>
      <p className="text-xs text-emerald-600 mb-3">No purchases needed. Start right now.</p>
      <ol className="space-y-2">
        {wins.map((win, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-emerald-900">
            <span className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
            <span className="leading-relaxed">{win}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
