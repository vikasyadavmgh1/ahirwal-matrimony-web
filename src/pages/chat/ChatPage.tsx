import { useQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { apiClient } from '../../api/client'
import type { ApiResponse, ConversationDTO } from '../../types'
import { formatDistanceToNow } from '../../utils/date'
import { useNavigate } from 'react-router-dom'

export default function ChatPage() {
  const navigate = useNavigate()
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      apiClient.get<ApiResponse<ConversationDTO[]>>('/chat').then((r) => r.data.data),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Messages</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : conversations?.length ? (
        <div className="divide-y divide-gray-100 card overflow-hidden">
          {conversations.map((c) => (
            <button
              key={c.conversationId}
              onClick={() => navigate(`/chat/${c.conversationId}`)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden">
                {c.otherUserAvatar
                  ? <img src={c.otherUserAvatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold">
                      {c.otherUserName?.charAt(0) ?? '?'}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-900 text-sm">{c.otherUserName ?? 'Unknown'}</p>
                  {c.lastMessageAt && <p className="text-xs text-gray-400">{formatDistanceToNow(c.lastMessageAt)}</p>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.lastMessage ?? 'No messages yet'}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Accept an interest to start chatting</p>
        </div>
      )}
    </div>
  )
}
