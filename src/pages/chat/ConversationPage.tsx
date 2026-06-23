import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Send } from 'lucide-react'
import { apiClient } from '../../api/client'
import type { ApiResponse, ChatMessage } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { formatDistanceToNow } from '../../utils/date'

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { userId } = useAuthStore()
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/${conversationId}/messages`)
        .then((r) => r.data.data),
    refetchInterval: 3000, // poll every 3s until WebSocket is wired
  })

  // Mark as read when opened
  useEffect(() => {
    if (conversationId) {
      apiClient.patch(`/chat/${conversationId}/read`).catch(() => {})
    }
  }, [conversationId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMut = useMutation({
    mutationFn: (content: string) =>
      apiClient.post(`/chat/${conversationId}/messages`, { content }),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMut.mutate(text.trim())
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate('/chat')} className="text-gray-500 hover:text-gray-700">
          <ChevronLeft size={22} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
          M
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Match</p>
          <p className="text-xs text-gray-400">Active recently</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-10 w-40 rounded-2xl bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages?.length ? (
          messages.map((msg) => {
            const isMine = msg.senderId === userId
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                    {formatDistanceToNow(msg.sentAt)}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-gray-400 text-sm pt-10">
            No messages yet. Say hello! 👋
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <input
          type="text"
          className="input flex-1"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMut.isPending}
          className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
