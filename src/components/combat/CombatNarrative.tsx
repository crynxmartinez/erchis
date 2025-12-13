'use client'

import { useEffect, useRef } from 'react'

interface CombatNarrativeProps {
  narrative: string
  isAnimating?: boolean
}

export default function CombatNarrative({
  narrative,
  isAnimating = false,
}: CombatNarrativeProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [narrative])

  return (
    <div className="bg-[#1a1a1a]/95 border border-[#444] rounded-lg backdrop-blur-sm flex flex-col h-[300px]">
      <div className="px-4 py-2 border-b border-[#333]">
        <h3 className="text-sm font-semibold text-[#6eb5ff]">📜 Combat Log</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {narrative ? (
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {narrative.split('\n\n').map((paragraph, index) => (
              <p 
                key={index} 
                className={`mb-3 ${
                  paragraph.includes('Critical') ? 'text-yellow-400 font-semibold' :
                  paragraph.includes('defeated') ? 'text-green-400 font-semibold' :
                  paragraph.includes('Victory') ? 'text-[#6eb5ff] font-semibold' :
                  paragraph.includes('damage to you') ? 'text-red-300' :
                  ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            The battle begins... Queue your actions and execute your turn!
          </p>
        )}
        
        {isAnimating && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="animate-pulse">●</span>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}
