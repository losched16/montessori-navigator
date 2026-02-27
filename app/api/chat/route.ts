import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateChatResponse } from '@/lib/anthropic'
import { getFamilyContext } from '@/lib/supabase'

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

    // Generate AI response
    const response = await generateChatResponse(message, context, conversationHistory || [])

    // Save messages to thread
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
      // Save user message
      await supabase.from('chat_messages').insert({
        thread_id: currentThreadId,
        role: 'user',
        content: message,
      })

      // Save assistant response
      await supabase.from('chat_messages').insert({
        thread_id: currentThreadId,
        role: 'assistant',
        content: response.message,
        memory_suggestions: response.memory_suggestions,
      })
    }

    // Auto-save high-confidence memory suggestions
    const suggestions = response.memory_suggestions

    if (suggestions?.parent_preferences) {
      for (const pref of suggestions.parent_preferences) {
        if (pref.confidence > 0.75) {
          await supabase.from('parent_preferences').upsert({
            parent_id: parent.id,
            key: pref.key,
            value: pref.value,
          })
        }
      }
    }

    if (suggestions?.child_observations) {
      for (const obs of suggestions.child_observations) {
        if (obs.confidence > 0.75) {
          // Find child by name
          const { data: children } = await supabase
            .from('children')
            .select('id')
            .eq('parent_id', parent.id)

          const child = (children || []).find((c: any) =>
            c.name?.toLowerCase() === obs.child_name?.toLowerCase()
          )

          if (child) {
            if (obs.type === 'trait') {
              await supabase.from('child_traits').insert({
                child_id: child.id,
                note: obs.note,
              })
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: response.message,
      threadId: currentThreadId,
      memory_suggestions: suggestions,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
