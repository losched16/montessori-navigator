import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NAVIGATOR_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY!,
})

// ================================================
// TYPES
// ================================================

export interface RoomAnalysis {
  room_description: string
  current_layout: string[]
  child_height_elements: string[]
  adult_height_elements: string[]
  safety_concerns: string[]
  strengths: string[]
  recommendations: Array<{
    title: string
    description: string
    priority: 'essential' | 'recommended' | 'nice_to_have'
    estimated_cost: 'free' | '$' | '$$' | '$$$'
  }>
  transformation_description: string
}

// ================================================
// ROOM-SPECIFIC MONTESSORI GUIDANCE
// ================================================

const ROOM_LABELS: Record<string, string> = {
  entryway: 'Entryway / Mudroom',
  childs_room: "Child's Bedroom",
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  living_learning: 'Living / Learning Room',
  outdoor: 'Outdoor Space',
}

const AGE_DESCRIPTIONS: Record<string, string> = {
  '0-3': 'an infant/toddler (birth to 3 years)',
  '3-6': 'a preschool-age child (3-6 years)',
  '6-9': 'a lower elementary child (6-9 years)',
  '9-12': 'an upper elementary child (9-12 years)',
  '12+': 'an adolescent (12+ years)',
}

function getRoomGuidance(room: string, agePlane: string): string {
  const guides: Record<string, Record<string, string>> = {
    entryway: {
      '0-3': `Key principles for a toddler entryway:
- LOW HOOKS (child height, 24-30" from floor) for coat and bag
- Low bench or stool for sitting while putting on shoes
- Shoe basket or low shelf at floor level
- Mirror at child height to check appearance
- Small basket for outdoor accessories (hat, mittens)
- Clear "in/out" routine visual`,
      '3-6': `Key principles for a 3-6 entryway:
- Hooks at child height (36-42" from floor)
- Designated space for school bag/lunchbox
- Mirror at child height
- Shoe rack the child can reach
- A small bench for independence in dressing
- Simple visual routine chart if helpful`,
      default: `Key principles:
- Hooks, shelves, and storage at the child's height
- Everything the child needs to independently dress and prepare to leave
- Mirror for self-checking
- Clear organization system`,
    },
    childs_room: {
      '0-3': `Key principles for a 0-3 bedroom:
- FLOOR BED (mattress on floor or very low frame) — the cornerstone of Montessori infant/toddler rooms
- Low open shelving with 6-8 carefully chosen activities, rotated weekly
- Child-height mirror (secured to wall) near floor bed
- Soft, neutral color palette — not overstimulating
- Minimal wall art at child's eye level, not adult height
- Small reading nook with forward-facing book display
- Everything accessible — child can move freely and choose independently
- No crib, no playpen — the room IS the prepared environment
- Wardrobe or low dresser with limited clothing choices`,
      '3-6': `Key principles for a 3-6 bedroom:
- Low bed the child can get in/out of independently
- Open shelving for work/activities (8-12 items, rotated)
- Child-accessible wardrobe with limited daily choices
- Reading corner with comfortable seating
- Art display at child height
- Small desk or table for work
- Natural materials (wood, cotton, wool) over plastic
- Uncluttered — everything has a specific place`,
      default: `Key principles:
- Bed and furniture the child can use independently
- Organized storage systems
- Dedicated reading and work areas
- Peaceful, uncluttered aesthetic
- Everything accessible and purposeful`,
    },
    kitchen: {
      '0-3': `Key principles for a toddler kitchen:
- LEARNING TOWER or sturdy step stool at counter height
- Low shelf or drawer with child's own dishes (real, breakable — small ceramic)
- Child-size pitcher for pouring water
- Small table and chair for snack preparation
- Accessible fruit/snack area at child height
- A low drawer or basket with safe utensils
- Hand-washing station or step to the sink`,
      '3-6': `Key principles for a 3-6 kitchen:
- Step stool or learning tower for counter work
- Own dishes in an accessible cabinet
- Designated prep area with child-safe tools (crinkle cutter, small pitcher, child knife)
- Involvement in real meal preparation
- Cleaning supplies at their level (small broom, dustpan, sponge)
- Simple recipe cards with pictures`,
      default: `Key principles:
- Counter access for food preparation
- Real tools and dishes accessible
- Involvement in meal planning and cooking
- Cleaning supplies available
- Increasing independence in kitchen tasks`,
    },
    bathroom: {
      '0-3': `Key principles for a toddler bathroom:
- Step stool at the sink for hand washing
- Low towel hooks the child can reach
- Mirror at child height above a low stool
- Toothbrush holder within reach
- Hamper for dirty clothes at child height
- Simple potty or potty seat when ready
- Low hooks for towel and robe`,
      '3-6': `Key principles for a 3-6 bathroom:
- Step stool or platform to reach the sink independently
- Own shelf or basket for toiletries
- Mirror at their height
- Towel hooks they can reach
- Simple grooming tools (hairbrush, toothbrush) organized
- A small clock to support routine timing`,
      default: `Key principles:
- Full independence in hygiene routine
- Accessible storage for personal items
- Appropriate step access
- Clear organization`,
    },
    living_learning: {
      '0-3': `Key principles for a toddler living/learning space:
- Low open shelves with 6-10 activities on trays
- A defined work rug or mat area
- Forward-facing book display at floor level
- Movement area (mirror, pull-up bar for cruising babies)
- Art area with low easel or table
- Minimal, calm aesthetic — not a toy explosion
- Natural light, plants, and beautiful objects at child height
- Music area with real instruments (small drum, shaker)`,
      '3-6': `Key principles for a 3-6 learning space:
- Organized open shelving by curriculum area
- Individual work mats/rugs
- Art station with quality materials
- Reading nook with comfortable seating
- Nature/science area with real specimens
- Cultural materials (globe, maps)
- Uninterrupted work space — no screens in this area`,
      default: `Key principles:
- Organized by subject/interest area
- Quality materials accessible
- Comfortable reading and work areas
- Dedicated creative space
- Natural elements and beauty`,
    },
    outdoor: {
      '0-3': `Key principles for a toddler outdoor space:
- Safe ground surface (grass, soft mulch)
- Low climbing structures or natural elements
- Sand/water play area
- Garden bed at child height for digging
- Push toys, balls, and movement materials
- Nature exploration supplies (magnifying glass, bucket)
- Shaded rest area`,
      '3-6': `Key principles for a 3-6 outdoor space:
- Garden bed the child tends independently
- Climbing and balance structures
- Sand pit or water play station
- Outdoor art/work table
- Nature investigation tools
- Wheeled vehicles (balance bike, tricycle)
- Open running space
- Bug hotel, bird feeder — connection to nature`,
      default: `Key principles:
- Active movement opportunities
- Garden for growing and caring for plants
- Nature exploration and investigation
- Creative play spaces
- Connection to the natural world`,
    },
  }

  const roomGuides = guides[room] || guides.living_learning
  return roomGuides[agePlane] || roomGuides.default || roomGuides['3-6'] || ''
}

// ================================================
// CLAUDE VISION ANALYSIS
// ================================================

export async function analyzeRoom(
  imageBase64: string,
  mediaType: string,
  room: string,
  agePlane: string | null
): Promise<RoomAnalysis> {
  const roomLabel = ROOM_LABELS[room] || 'Room'
  const ageDesc = agePlane ? AGE_DESCRIPTIONS[agePlane] || 'a child' : 'a child'
  const guidance = getRoomGuidance(room, agePlane || '3-6')

  const systemPrompt = `You are an expert Montessori home environment consultant working for the Montessori Foundation. You are analyzing a photo of a parent's ${roomLabel} to recommend Montessori transformations appropriate for ${ageDesc}.

Analyze the photo carefully and return a JSON response with this exact structure:
{
  "room_description": "A 2-3 sentence description of the room as it currently appears — its size, style, notable features",
  "current_layout": ["List each major piece of furniture or feature visible in the photo"],
  "child_height_elements": ["Things already at child height or accessible to a child"],
  "adult_height_elements": ["Things only accessible to adults that could potentially be moved lower or adapted"],
  "safety_concerns": ["Any safety hazards visible — sharp corners, unsecured furniture, cords, etc."],
  "strengths": ["What the room already does well for a Montessori approach"],
  "recommendations": [
    {
      "title": "Short recommendation name",
      "description": "Specific, actionable recommendation for THIS room based on what you see",
      "priority": "essential OR recommended OR nice_to_have",
      "estimated_cost": "free OR $ OR $$ OR $$$"
    }
  ],
  "transformation_description": "Write a highly detailed, vivid description (200-300 words) of how this EXACT room would look after a Montessori transformation. CRITICAL: The room's physical structure MUST remain EXACTLY the same — same walls, same windows in the same positions, same doors, same floor, same ceiling, same room shape and dimensions, same architectural features, same paint color or wall treatment. You are ONLY replacing or adding furniture, toys, and Montessori materials WITHIN the existing room structure. Describe precisely which existing furniture pieces are removed and what Montessori-appropriate items replace them in those same locations. Describe what new Montessori elements are added and where they are placed relative to the existing walls, windows, and doors. Be extremely specific about spatial layout using the room's actual features as reference points (e.g., 'against the left wall below the window', 'in the corner near the door'). Include natural materials (wood, cotton, linen), specific Montessori items appropriate for ${ageDesc}, and warm styling details. This description will be used to generate a photorealistic image of THIS SAME ROOM with Montessori furnishings — the room structure must be unmistakably the same room."
}

MONTESSORI ENVIRONMENT PRINCIPLES FOR ${roomLabel.toUpperCase()}:
${guidance}

IMPORTANT RULES:
- Be specific to what you ACTUALLY SEE in the photo — don't give generic advice
- Include 4-8 recommendations, sorted by priority
- The transformation_description must reference the actual room layout from the photo
- If the photo doesn't clearly show a room, set room_description to "unclear" and provide general guidance
- Always return valid JSON only — no text before or after the JSON`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: 'Analyze this room and provide your Montessori transformation assessment as JSON.',
        },
      ],
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse room analysis from Claude')
  }

  return JSON.parse(jsonMatch[0]) as RoomAnalysis
}

// ================================================
// OPENAI IMAGE GENERATION PROMPT
// ================================================

export function buildImagePrompt(
  analysis: RoomAnalysis,
  room: string,
  agePlane: string | null
): string {
  const roomLabel = ROOM_LABELS[room] || 'room'
  const ageDesc = agePlane ? AGE_DESCRIPTIONS[agePlane] || 'a child' : 'a child'

  return `A professional interior design photograph showing THIS EXACT SAME ROOM transformed into a Montessori-inspired ${roomLabel} for ${ageDesc}.

CRITICAL REQUIREMENT — PRESERVE THE ROOM STRUCTURE EXACTLY:
The room's walls, windows, doors, floor, ceiling, room shape, and architectural features must remain EXACTLY as they are. Do NOT change the room layout, wall positions, window positions, door positions, or any structural element. The room must be unmistakably the SAME physical space — only the furniture, decor, toys, and materials inside it should change to Montessori-appropriate items.

WHAT TO CHANGE (WITHIN THE SAME ROOM):
${analysis.transformation_description}

STYLE REQUIREMENTS:
- Photorealistic interior design photography of this same room
- Same room structure, same viewing angle, same architectural features
- Natural materials: light wood furniture, cotton textiles, linen, wool rugs
- Warm neutral palette (soft whites, creams, natural wood) with gentle accents
- Beautiful natural light from the existing windows
- Scandinavian-Montessori aesthetic — clean, minimal, purposeful
- Low child-height furniture — accessible and inviting
- Organized and uncluttered — everything has its place
- A few green plants and natural elements

IMPORTANT: Keep the room recognizable as the same physical space. Only the furniture and materials inside should be different — Montessori-appropriate items placed within the existing room structure. This should look like a real, lived-in home — warm and welcoming, not a sterile showroom.`
}
