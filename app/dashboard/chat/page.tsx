'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Array<{ id: string; title: string; created_at: string }>>([])
  const [showThreads, setShowThreads] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadThreads()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadThreads = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return

    const { data } = await supabase
      .from('chat_threads')
      .select('id, title, created_at')
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setThreads(data || [])
  }

  const loadThread = async (id: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('thread_id', id)
      .order('created_at')

    if (data) {
      setMessages(data.filter(m => m.role !== 'system') as Message[])
      setThreadId(id)
      setShowThreads(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setThreadId(null)
    setShowThreads(false)
    inputRef.current?.focus()
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          threadId,
          conversationHistory,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I had trouble responding. Please try again.' }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        if (data.threadId && !threadId) {
          setThreadId(data.threadId)
          loadThreads()
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "What activities should we try this week?",
    "How do I handle tantrums the Montessori way?",
    "What practical life activities work for a 3-year-old?",
    "How do I set up a reading corner at home?",
    "My child won't focus on activities. What should I do?",
    "How do I explain Montessori to my partner?",
  ]

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] sm:h-[calc(100vh-3.5rem)] -m-4 sm:-m-6">
      {/* Thread sidebar - desktop */}
      <div className={`${showThreads ? 'block' : 'hidden'} sm:block w-64 border-r border-gray-100 bg-white flex-shrink-0 overflow-y-auto`}>
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full py-2 px-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
          >
            + New Conversation
          </button>
        </div>
        <div className="px-3 pb-3 space-y-0.5">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => loadThread(thread.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition ${
                threadId === thread.id
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {thread.title || 'Untitled'}
            </button>
          ))}
          {threads.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile thread toggle */}
        <div className="sm:hidden flex items-center gap-2 p-3 border-b border-gray-100 bg-white">
          <button
            onClick={() => setShowThreads(!showThreads)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ☰ Chats
          </button>
          <button onClick={startNewChat} className="ml-auto text-sm text-teal-500 font-medium">
            + New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-4xl mb-3">🌿</div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">Montessori Guide</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Ask me anything about Montessori parenting, curriculum, child development, or setting up your home environment.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-left p-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-teal-300 hover:text-teal-600 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-700'
              }`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant' ? 'prose-navigator' : ''
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white p-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Montessori parenting, curriculum, activities..."
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none max-h-32"
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-teal-500"
            >
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
