'use client'

interface Announcement {
  id: number
  title: string
  posted: string
  author: string
  authorColor: string
}

const announcements: Announcement[] = [
  {
    id: 1,
    title: 'Patch list #412 : 09/12/2025',
    posted: '20:40:00 - 09/12/25',
    author: 'SYSTEM',
    authorColor: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: 2,
    title: 'Elimination 2025',
    posted: '17:19:34 - 05/11/25',
    author: 'SYSTEM',
    authorColor: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: 3,
    title: 'Patch list #411 : 02/12/2025',
    posted: '20:45:22 - 02/12/25',
    author: 'SYSTEM',
    authorColor: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'Patch list #410 : 25/11/2025',
    posted: '21:10:38 - 25/11/25',
    author: 'SYSTEM',
    authorColor: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: 5,
    title: 'Patch list #409 : 19/11/2025',
    posted: '21:44:42 - 19/11/25',
    author: 'SYSTEM',
    authorColor: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
]

export default function Announcements() {
  return (
    <div className="bg-[#242424] rounded border border-[#333]">
      {/* Header */}
      <div className="bg-[#2a2a2a] px-3 py-2 border-b border-[#333] flex items-center">
        <span className="text-[#6eb5ff] text-sm font-medium">Announcements ({announcements.length})</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e1e1e] text-gray-400 text-xs">
              <th className="text-left px-3 py-2 font-medium w-8"></th>
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-left px-3 py-2 font-medium w-36">Posted</th>
              <th className="text-left px-3 py-2 font-medium w-24">Author</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement, index) => (
              <tr
                key={announcement.id}
                className={`border-t border-[#333] hover:bg-[#2a2a2a] transition-colors ${
                  index % 2 === 0 ? 'bg-[#242424]' : 'bg-[#222]'
                }`}
              >
                <td className="px-3 py-2">
                  <span className="text-gray-500">📄</span>
                </td>
                <td className="px-3 py-2">
                  <a href="#" className="text-[#6eb5ff] hover:underline">
                    {announcement.title}
                  </a>
                </td>
                <td className="px-3 py-2 text-gray-400 text-xs">
                  {announcement.posted}
                </td>
                <td className="px-3 py-2">
                  <span className={`${announcement.authorColor} text-white text-xs px-2 py-0.5 rounded`}>
                    {announcement.author}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
