'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ExpandableCardProps {
  href: string
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
}

export default function ExpandableCard({ href, children, expandedContent, className = '' }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Desktop: normal link */}
      <Link href={href} className={`hidden sm:block tap-scale ${className}`}>
        {children}
      </Link>

      {/* Mobile: expandable card */}
      <div className={`sm:hidden ${className}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="tap-scale w-full text-left"
        >
          {children}
        </button>
        <div
          className="grid transition-all duration-200 ease-in-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            {expandedContent && (
              <div className="pt-3 pb-1 px-1 border-t border-gray-100 mt-3 flex flex-wrap gap-2">
                {expandedContent}
                <Link
                  href={href}
                  className="tap-scale px-4 py-2.5 text-sm font-medium text-warm-600 bg-warm-50 rounded-xl min-h-[44px] flex items-center"
                >
                  View Details →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
