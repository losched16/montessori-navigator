import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { streamChatResponse } from '@/lib/anthropic'
import type { MemorySuggestion } from '@/lib/anthropic'
import { getFamilyContext } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function saveMemorySuggestions(supabase: any, parentId: string, suggestions: MemorySuggestion) {
  if (suggestions?.parent_preferences) {
    for (const pref of suggestions.parent_preferences) {
      if (pref.confidence > 0.75) {
        await supabase.from('parent_preferences').upsert({
          parent_id: parentId,
          key: pref.key,
          value: pref.value,
        })
      }
    }
  }

  if (suggestions?.child_observations) {
    const { data: children } = await supabase
      .from('children')
      .select('id, name')
      .eq('parent_id', parentId)

    for (const obs of suggestions.child_observations) {
      if (obs.confidence <= 0.75 || obs.type !== 'trait') continue

      const child = (children || []).find((c: any) =>
        c.name?.toLowerCase() === obs.child_name?.toLowerCase()
      )

      if (child) {
        await supabase.from('child_traits').insert({
          child_id: child.id,
          note: obs.note,
        })
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
          remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, threadId, conversationHistory } = await request.json()

    // Get parent
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    // Get full family context
    const context = await getFamilyContext(supabase, parent.id)
    if (!context) {
      return NextResponse.json({ error: 'Could not load family context' }, { status: 500 })
    }

    // Create the thread and store the parent's message up front, so the
    // conversation survives even if the model call fails mid-stream.
    let currentThreadId = threadId
    if (!currentThreadId) {
      const { data: thread } = await supabase
        .from('chat_threads')
        .insert({
          parent_id: parent.id,
          title: message.substring(0, 60) + (message.length > 60 ? '...' : ''),
        })
        .select()
        .single()

      currentThreadId = thread?.id
    }

    if (currentThreadId) {
      await supabase.from('chat_messages').insert({
        thread_id: currentThreadId,
        role: 'user',
        content: message,
      })
    }

    const encoder = new TextEncoder()
    const send = (controller: ReadableStreamDefaultController, payload: any) => {
      controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          send(controller, { type: 'meta', threadId: currentThreadId || null })

          let finalMessage = ''
          let suggestions: MemorySuggestion = {}

          for await (const chunk of streamChatResponse(message, context, conversationHistory || [])) {
            if (chunk.type === 'delta') {
              send(controller, { type: 'delta', text: chunk.text })
            } else {
              finalMessage = chunk.message
              suggestions = chunk.memory_suggestions
            }
          }

          let assistantMessageId: string | null = null
          if (currentThreadId) {
            const { data: assistantMsg } = await supabase.from('chat_messages').insert({
              thread_id: currentThreadId,
              role: 'assistant',
              content: finalMessage,
              memory_suggestions: suggestions,
            }).select('id').single()

            assistantMessageId = assistantMsg?.id || null
          }

          await saveMemorySuggestions(supabase, parent.id, suggestions)

          send(controller, {
            type: 'done',
            message: finalMessage,
            threadId: currentThreadId || null,
            messageId: assistantMessageId,
            memory_suggestions: suggestions,
          })
        } catch (error) {
          console.error('Chat stream error:', error)
          send(controller, { type: 'error', error: 'Failed to generate response' })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, no-transform',
        // Stop nginx-style proxies from buffering the stream into one blob
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
