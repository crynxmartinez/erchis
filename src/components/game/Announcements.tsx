'use client'

export default function Announcements() {
  return (
    <div className="bg-[#242424] rounded border border-[#333]">
      {/* Header */}
      <div className="bg-[#2a2a2a] px-3 py-2 border-b border-[#333] flex items-center">
        <span className="text-[#6eb5ff] text-sm font-medium">Announcements</span>
      </div>

      {/* Empty State */}
      <div className="p-4 text-center text-gray-500 text-sm">
        No announcements
      </div>
    </div>
  )
}
