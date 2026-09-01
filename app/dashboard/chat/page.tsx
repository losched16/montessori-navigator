'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { getAttachments, getFollowUps, classifyTopic } from '@/lib/abigail'
import AbigailHeader from '@/components/abigail/AbigailHeader'
import AbigailEmptyState from '@/components/abigail/AbigailEmptyState'
import AssistantMessage from '@/components/abigail/AssistantMessage'
import ChatComposer from '@/components/abigail/ChatComposer'
import ConversationRail from '@/components/abigail/ConversationRail'
import ConversationHistorySheet, { type ThreadSummary } from '@/components/abigail/ConversationHistorySheet'
import AbigailMark from '@/components/abigail/AbigailMark'
import Toast from '@/components/ui/Toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
  saved?: boolean
}

export default function ChatPage() {
  const { selectedChild, selectedChildId } = useChild()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [failedMessage, setFailedMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // 'auto' for thread loads (no jarring animated scroll through history),
  // 'smooth' for new messages.
  const scrollBehaviorRef = useRef<ScrollBehavior>('auto')
  const supabase = createClient()

  const childFirst = selectedChild?.name.trim().split(/\s+/)[0]

  useEffect(() => {
    loadThreads()
    const params = new URLSearchParams(window.location.search)
    // Prefill from Home's Abigail card / hero links (?q=...) — never auto-send.
    const q = params.get('q')
    if (q) {
      setInput(q)
      inputRef.current?.focus()
    }
    // Deep link from Saved Guidance (?thread=...). Never trust the URL:
    // explicitly verify the thread belongs to the authenticated parent
    // before loading it (RLS is the backstop, this is the guarantee).
    const threadParam = params.get('thread')
    if (threadParam) {
      const openOwnThread = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
        if (!parent) return
        const { data: owned } = await supabase
          .from('chat_threads')
          .select('id')
          .eq('id', threadParam)
          .eq('parent_id', parent.id)
          .maybeSingle()
        if (owned) loadThread(owned.id)
      }
      openOwnThread()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current })
    scrollBehaviorRef.current = 'smooth'
  }, [messages, loading])

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

      scrollBehaviorRef.current = 'auto'
      setMessages(msgs)
      setThreadId(id)
      setFailedMessage(null)
    }
  }

  const startNewChat = useCallback(() => {
    setMessages([])
    setThreadId(null)
    setFailedMessage(null)
    inputRef.current?.focus()
  }, [])

  const send = async (text: string, opts: { echo?: boolean } = {}) => {
    const userMessage = text.trim()
    if (!userMessage || loading) return

    setFailedMessage(null)
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
    if (opts.echo !== false) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    }
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          threadId,
          conversationHistory: history,
          childId: selectedChildId || undefined,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setFailedMessage(userMessage)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, id: data.messageId || undefined }])
        if (data.threadId && !threadId) {
          setThreadId(data.threadId)
          loadThreads()
        }
        // One-time gentle save tip after the first answer
        if (!localStorage.getItem('montessori_save_tip_dismissed')) {
          localStorage.setItem('montessori_save_tip_dismissed', 'true')
          setToast('Helpful? Save guidance you want to return to.')
        }
      }
    } catch {
      setFailedMessage(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    const text = input
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    send(text)
  }

  const toggleSaveGuidance = async (msgIndex: number) => {
    const msg = messages[msgIndex]
    if (!msg || msg.role !== 'assistant') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return

    if (msg.saved) {
      if (msg.id) {
        await supabase.from('saved_memories').delete().eq('parent_id', parent.id).eq('message_id', msg.id)
      }
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, saved: false } : m))
    } else {
      await supabase.from('saved_memories').insert({
        parent_id: parent.id,
        message_id: msg.id || null,
        content: msg.content,
      })
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, saved: true } : m))
      setToast('Guidance saved')
    }
  }

  // Deterministic attachments per assistant message, keyed off the paired
  // user question. Recomputed only when the conversation or child changes.
  const attachmentsByIndex = useMemo(() => {
    return messages.map((m, i) => {
      if (m.role !== 'assistant') return undefined
      const question = [...messages.slice(0, i)].reverse().find(x => x.role === 'user')?.content
      if (!question) return undefined
      return getAttachments(question, selectedChild)
    })
  }, [messages, selectedChild?.id])

  const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant')
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content
  const followUps = lastUserMessage && !loading
    ? getFollowUps(classifyTopic(lastUserMessage), childFirst)
    : []

  const focusComposer = () => inputRef.current?.focus()

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] sm:h-[calc(100vh-3.5rem)] -m-4 sm:-m-6">
      <ConversationRail
        threads={threads}
        activeThreadId={threadId}
        onSelect={loadThread}
        onNew={startNewChat}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[color:var(--mfa-canvas)]">
        <AbigailHeader
          hasMessages={messages.length > 0}
          onHistory={() => setHistoryOpen(true)}
          onNewConversation={startNewChat}
        />

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !loading ? (
            <AbigailEmptyState
              child={selectedChild}
              onPickPrompt={(text) => { setInput(text); inputRef.current?.focus() }}
              onHistory={() => setHistoryOpen(true)}
              hasThreads={threads.length > 0}
            />
          ) : (
            <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-5 space-y-6">
              {messages.map((msg, i) => (
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[78%] rounded-[20px] rounded-br-md bg-[color:var(--mfa-purple)] text-white px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AssistantMessage
                    key={i}
                    content={msg.content}
                    saved={!!msg.saved}
                    onToggleSave={() => toggleSaveGuidance(i)}
                    onAskFollowUp={focusComposer}
                    childFirstName={childFirst}
                    attachments={attachmentsByIndex[i]}
                    followUps={i === lastAssistantIndex ? followUps : undefined}
                    onSendFollowUp={(text) => send(text)}
                  />
                )
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <AbigailMark size={28} />
                  <span className="text-[14px] text-[color:var(--mfa-ink-muted)] animate-pulse">
                    Abigail is thinking...
                  </span>
                </div>
              )}

              {failedMessage && !loading && (
                <div className="flex gap-3">
                  <AbigailMark size={28} className="mt-0.5 opacity-50" />
                  <div className="rounded-[16px] bg-white border border-[color:var(--mfa-border)] p-4">
                    <p className="text-[14.5px] text-[color:var(--mfa-ink)] mb-2.5">
                      I couldn&apos;t answer that just now. Please try again.
                    </p>
                    <button
                      onClick={() => send(failedMessage, { echo: false })}
                      className="tap-scale inline-flex items-center min-h-[44px] px-4 rounded-full bg-[color:var(--mfa-purple-soft)] text-[14px] font-semibold text-[color:var(--mfa-purple)]"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatComposer
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={loading}
          childName={childFirst}
        />
      </div>

      <ConversationHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        threads={threads}
        activeThreadId={threadId}
        onSelect={loadThread}
        onNew={startNewChat}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
