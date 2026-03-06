import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getOpenAIClient } from '@/lib/openai'
import { analyzeRoom, buildImagePrompt } from '@/lib/room-vision'

// Allow up to 60s for Claude Vision + OpenAI image generation
export const maxDuration = 60

const MAX_VISIONS_PER_ROOM = 3

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

    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body

    // =============================================
    // ACTION: Generate a room vision
    // =============================================
    if (action === 'generate') {
      const { imageBase64, mediaType, room, agePlane } = body

      if (!imageBase64 || !room) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Check generation limit
      const { count } = await supabase
        .from('room_visions')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parent.id)
        .eq('room', room)
        .in('status', ['complete', 'analyzing', 'generating'])

      if ((count || 0) >= MAX_VISIONS_PER_ROOM) {
        return NextResponse.json(
          { error: 'You\'ve reached the limit of 3 visions for this room.' },
          { status: 429 }
        )
      }

      // Create initial DB record
      const { data: vision, error: insertError } = await supabase
        .from('room_visions')
        .insert({
          parent_id: parent.id,
          room,
          age_plane: agePlane || null,
          original_image_path: '',
          status: 'analyzing',
          analysis: {},
        })
        .select()
        .single()

      if (insertError || !vision) {
        console.error('Failed to create vision record:', insertError)
        return NextResponse.json({ error: 'Failed to start vision' }, { status: 500 })
      }

      try {
        // Upload original image to Supabase Storage
        const buffer = Buffer.from(imageBase64, 'base64')
        const originalPath = `${parent.id}/${vision.id}/original.jpg`
        const { error: uploadError } = await supabase.storage
          .from('room-vision-images')
          .upload(originalPath, buffer, {
            contentType: mediaType || 'image/jpeg',
            upsert: false,
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          // Continue anyway — analysis still works without storage
        }

        // Step 1: Claude Vision analysis
        const analysis = await analyzeRoom(
          imageBase64,
          mediaType || 'image/jpeg',
          room,
          agePlane
        )

        // Update status to generating
        await supabase
          .from('room_visions')
          .update({
            status: 'generating',
            analysis,
            original_image_path: originalPath,
          })
          .eq('id', vision.id)

        // Step 2: OpenAI image generation
        let generatedImagePath: string | null = null
        let generationPrompt: string | null = null

        try {
          generationPrompt = buildImagePrompt(analysis, room, agePlane)

          const imageResponse = await getOpenAIClient().images.generate({
            model: 'gpt-image-1',
            prompt: generationPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'high',
          })

          // gpt-image-1 returns b64_json by default
          const generatedB64 = imageResponse.data?.[0]?.b64_json
          if (generatedB64) {
            const genBuffer = Buffer.from(generatedB64, 'base64')
            generatedImagePath = `${parent.id}/${vision.id}/generated.png`

            const { error: genUploadError } = await supabase.storage
              .from('room-vision-images')
              .upload(generatedImagePath, genBuffer, {
                contentType: 'image/png',
                upsert: false,
              })

            if (genUploadError) {
              console.error('Generated image upload error:', genUploadError)
              generatedImagePath = null
            }
          }
        } catch (genError) {
          console.error('Image generation error:', genError)
          // Graceful degradation — still return analysis without generated image
        }

        // Update to complete
        await supabase
          .from('room_visions')
          .update({
            status: 'complete',
            generated_image_path: generatedImagePath,
            generation_prompt: generationPrompt,
          })
          .eq('id', vision.id)

        // Generate signed URLs
        let originalImageUrl: string | null = null
        let generatedImageUrl: string | null = null

        if (originalPath) {
          const { data: origUrl } = await supabase.storage
            .from('room-vision-images')
            .createSignedUrl(originalPath, 3600)
          originalImageUrl = origUrl?.signedUrl || null
        }

        if (generatedImagePath) {
          const { data: genUrl } = await supabase.storage
            .from('room-vision-images')
            .createSignedUrl(generatedImagePath, 3600)
          generatedImageUrl = genUrl?.signedUrl || null
        }

        return NextResponse.json({
          vision: {
            id: vision.id,
            room,
            age_plane: agePlane,
            analysis,
            originalImageUrl,
            generatedImageUrl,
            status: 'complete',
            created_at: vision.created_at,
          },
        })
      } catch (error: any) {
        console.error('Room vision generation error:', error)

        // Update DB to failed
        await supabase
          .from('room_visions')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
          })
          .eq('id', vision.id)

        return NextResponse.json(
          { error: 'Failed to generate room vision. Please try again.' },
          { status: 500 }
        )
      }
    }

    // =============================================
    // ACTION: List previous visions for a room
    // =============================================
    if (action === 'list') {
      const { room } = body

      const { data: visions } = await supabase
        .from('room_visions')
        .select('*')
        .eq('parent_id', parent.id)
        .eq('room', room)
        .in('status', ['complete'])
        .order('created_at', { ascending: false })

      // Generate signed URLs for each
      const visionsWithUrls = await Promise.all(
        (visions || []).map(async (v: any) => {
          let originalImageUrl: string | null = null
          let generatedImageUrl: string | null = null

          if (v.original_image_path) {
            const { data } = await supabase.storage
              .from('room-vision-images')
              .createSignedUrl(v.original_image_path, 3600)
            originalImageUrl = data?.signedUrl || null
          }

          if (v.generated_image_path) {
            const { data } = await supabase.storage
              .from('room-vision-images')
              .createSignedUrl(v.generated_image_path, 3600)
            generatedImageUrl = data?.signedUrl || null
          }

          return {
            id: v.id,
            room: v.room,
            age_plane: v.age_plane,
            analysis: v.analysis,
            originalImageUrl,
            generatedImageUrl,
            status: v.status,
            created_at: v.created_at,
          }
        })
      )

      return NextResponse.json({ visions: visionsWithUrls })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    console.error('Room vision API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
