'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import YouTubeEmbed from '@/components/youtube-embed'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
  saved?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Array<{ id: string; title: string; created_at: string }>>([])
  const [showThreads, setShowThreads] = useState(false)
  const [showSaveTip, setShowSaveTip] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadThreads()
    // Show save tip for first-time users
    if (!localStorage.getItem('montessori_save_tip_dismissed')) {
      setShowSaveTip(true)
    }
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
      .select('id, role, content')
      .eq('thread_id', id)
      .order('created_at')

    if (data) {
      const msgs = data.filter(m => m.role !== 'system') as Message[]

      // Check which assistant messages are already saved
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
        if (parent) {
          const msgIds = msgs.filter(m => m.role === 'assistant' && m.id).map(m => m.id!)
          if (msgIds.length > 0) {
            const { data: saved } = await supabase
              .from('saved_memories')
              .select('message_id')
              .eq('parent_id', parent.id)
              .in('message_id', msgIds)
            const savedIds = new Set((saved || []).map((s: any) => s.message_id))
            msgs.forEach(m => { if (m.id && savedIds.has(m.id)) m.saved = true })
          }
        }
      }

      setMessages(msgs)
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
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, id: data.messageId || undefined }])
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

  const dismissSaveTip = () => {
    setShowSaveTip(false)
    localStorage.setItem('montessori_save_tip_dismissed', 'true')
  }

  const toggleSaveMemory = async (msgIndex: number) => {
    const msg = messages[msgIndex]
    if (!msg || msg.role !== 'assistant') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return

    if (msg.saved) {
      // Unsave
      if (msg.id) {
        await supabase.from('saved_memories').delete().eq('parent_id', parent.id).eq('message_id', msg.id)
      }
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, saved: false } : m))
    } else {
      // Save
      await supabase.from('saved_memories').insert({
        parent_id: parent.id,
        message_id: msg.id || null,
        content: msg.content,
      })
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, saved: true } : m))
    }
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/\[VIDEO:([a-zA-Z0-9_-]+)\]/)
    if (parts.length === 1) return content
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <div key={i} className="my-3"><YouTubeEmbed videoId={part} /></div>
      }
      return part ? <span key={i}>{part}</span> : null
    })
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
            className="w-full py-2 px-3 bg-warm-500 hover:bg-warm-600 text-white text-sm font-medium rounded-lg transition"
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
                  ? 'bg-warm-50 text-warm-700'
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
          <button onClick={startNewChat} className="ml-auto text-sm text-warm-600 font-medium">
            + New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-4xl mb-3">🌿</div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">Abigail</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Your AI-powered Montessori guide. Ask me anything about parenting, curriculum, child development, or setting up your home environment.
              </p>
              {/* Mobile: 3×2 grid of big colored tiles */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg sm:hidden">
                {suggestedQuestions.slice(0, 6).map((q, i) => {
                  const bgColors = ['bg-warm-50', 'bg-teal-50', 'bg-amber-50', 'bg-violet-50', 'bg-emerald-50', 'bg-sky-50']
                  return (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus() }}
                      className={`tap-scale text-left p-4 text-sm text-gray-600 ${bgColors[i % bgColors.length]} border border-gray-100 rounded-[22px] min-h-[100px] flex items-center hover:border-warm-300 hover:text-warm-600 transition`}
                    >
                      {q}
                    </button>
                  )
                })}
              </div>
              {/* Desktop: 2-col compact grid */}
              <div className="hidden sm:grid grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-left p-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-warm-300 hover:text-warm-600 transition"
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
                  ? 'bg-warm-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-700'
              }`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant' ? 'prose-navigator' : ''
                }`}>
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    {/* First-time callout - shown once on the first assistant message */}
                    {showSaveTip && i === messages.findIndex(m => m.role === 'assistant') && (
                      <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-semibold">Tip:</span> Found something helpful? Tap <span className="font-semibold">Save to Memories</span> below any response to keep it. Your saved memories appear in the Memories section and help your Guide give better advice over time.
                          </p>
                        </div>
                        <button onClick={dismissSaveTip} className="text-amber-400 hover:text-amber-600 text-sm shrink-0 leading-none mt-0.5">✕</button>
                      </div>
                    )}
                    <button
                      onClick={() => toggleSaveMemory(i)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                        msg.saved
                          ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                          : 'text-gray-500 bg-gray-50 border border-gray-150 hover:bg-warm-50 hover:text-warm-600 hover:border-warm-300'
                      }`}
                    >
                      {msg.saved ? '★ Saved to Memories' : '☆ Save to Memories'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[70%] bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <p className="text-sm leading-relaxed text-gray-700">
                  Ok, I&apos;m working on it. Give me a moment.
                </p>
                <p className="text-sm leading-relaxed text-gray-500 mt-0.5">— Abigail</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              className="flex-1 resize-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none max-h-32"
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
              className="tap-scale px-5 py-3.5 sm:px-4 sm:py-2.5 bg-warm-500 hover:bg-warm-600 text-white rounded-[18px] sm:rounded-xl transition disabled:opacity-40 disabled:hover:bg-warm-500 min-h-[54px] sm:min-h-0"
            >
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
