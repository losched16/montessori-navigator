// Montessori Home Environment Design Guide
// Comprehensive static data for preparing the home environment
// Grounded in Maria Montessori's philosophy of the prepared environment

export type RoomType = 'entryway' | 'childs_room' | 'kitchen' | 'bathroom' | 'living_learning' | 'outdoor'
export type AgePlane = '0-3' | '3-6' | '6-9' | '9-12' | '12+'

export interface SetupTip {
  text: string
  icon: string
  agePlanes: AgePlane[]  // empty = all ages
  priority: 'essential' | 'recommended' | 'nice_to_have'
}

export interface RecommendedItem {
  name: string
  description: string
  category: 'furniture' | 'material' | 'tool' | 'storage' | 'safety' | 'decor'
  icon: string
  agePlanes: AgePlane[]
  priceRange: '$' | '$$' | '$$$'
  searchQuery: string  // for Amazon search link
  diyAlternative?: string
}

export interface SafetyGuideline {
  text: string
  severity: 'critical' | 'important' | 'tip'
  agePlanes: AgePlane[]
}

export interface InspirationVideo {
  videoId: string
  title: string
  description: string
  agePlanes: AgePlane[]
}

export interface InspirationPhoto {
  src: string       // path relative to /public (e.g. '/images/environment/floor-bed.jpg')
  alt: string
  caption: string
  agePlanes: AgePlane[]
}

export interface RelatedArticleRef {
  slug: string
  relevance: string
}

export interface DesignPrinciple {
  title: string
  description: string
  icon: string
}

export interface RoomGuide {
  room: RoomType
  label: string
  icon: string
  heroEmoji: string
  tagline: string
  description: string
  designPrinciples: DesignPrinciple[]
  setupTips: SetupTip[]
  recommendedItems: RecommendedItem[]
  safetyGuidelines: SafetyGuideline[]
  inspirationVideos: InspirationVideo[]
  inspirationPhotos: InspirationPhoto[]
  relatedArticles: RelatedArticleRef[]
  quickWins: string[]
}

// ---------------------------------------------------------------------------
// Room Guide Data
// ---------------------------------------------------------------------------

export const ROOM_GUIDES: RoomGuide[] = [
  // =========================================================================
  // 1. ENTRYWAY
  // =========================================================================
  {
    room: 'entryway',
    label: 'Entryway',
    icon: 'DoorOpen',
    heroEmoji: '\u{1F6AA}',
    tagline: 'The first space your child navigates independently',
    description:
      'The entryway is the threshold between the outside world and the warmth of home. In Montessori philosophy, this transitional space is a powerful opportunity: when everything a child needs to arrive and depart is within reach, they practice sequencing, responsibility, and self-care every single day. A well-prepared entryway says to the child, "You are capable. You belong here. You can do this yourself."',
    designPrinciples: [
      {
        title: 'Child Height',
        description:
          'Every hook, shelf, and mirror should be placed at the child\'s eye and hand level so they can manage their own belongings without asking for help.',
        icon: 'Ruler',
      },
      {
        title: 'Independence',
        description:
          'The environment should allow the child to complete the full arrival and departure routine alone \u2014 hanging a coat, removing shoes, checking their appearance.',
        icon: 'UserCheck',
      },
      {
        title: 'Order',
        description:
          'A place for everything and everything in its place. Clear, consistent locations for each item reduce overwhelm and build the habit of caring for one\'s things.',
        icon: 'LayoutGrid',
      },
    ],
    quickWins: [
      'Move one or two coat hooks down to your child\'s shoulder height',
      'Place a small basket or tray near the door for shoes',
      'Hang a child-safe mirror at your child\'s eye level so they can check themselves before leaving',
    ],
    setupTips: [
      {
        text: 'Install low hooks at your child\'s shoulder height so they can hang their own coat, bag, and hat without assistance. Use sturdy wooden or metal hooks that won\'t pull out of the wall.',
        icon: 'Hook',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Place a small bench or stool where your child can sit to put on and remove shoes independently. This supports balance and sequencing skills.',
        icon: 'Armchair',
        agePlanes: ['0-3', '3-6'],
        priority: 'essential',
      },
      {
        text: 'Provide a shoe basket, low rack, or designated mat so your child knows exactly where shoes belong. Limit it to one or two pairs to avoid clutter.',
        icon: 'Footprints',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Create a dedicated coat-and-bag area with one hook per family member, labeled with a photo or name for younger children. This reinforces ownership and responsibility.',
        icon: 'ShirtIcon',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Add a small umbrella stand or basket near the door. Even toddlers enjoy the ritual of grabbing their own umbrella on a rainy day.',
        icon: 'Umbrella',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'nice_to_have',
      },
      {
        text: 'Hang a child-height mirror near the door so your child can check their appearance before leaving. This builds self-awareness and pride in self-care.',
        icon: 'ScanFace',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'For older children, provide a small tray or bowl for keys, bus passes, or personal items they need to remember when heading out.',
        icon: 'Key',
        agePlanes: ['6-9', '9-12', '12+'],
        priority: 'nice_to_have',
      },
      {
        text: 'Keep a small doormat inside the entry so the child can wipe feet as part of the arrival routine. This practical life skill happens naturally when the tool is accessible.',
        icon: 'RectangleHorizontal',
        agePlanes: [],
        priority: 'recommended',
      },
    ],
    recommendedItems: [
      {
        name: 'Low Wall Hooks',
        description:
          'Sturdy wooden or metal hooks mounted at child height for coats, bags, and hats. Choose hooks with rounded ends for safety.',
        category: 'furniture',
        icon: 'Hook',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'wooden wall hooks kids height montessori',
        diyAlternative: 'Screw simple wooden pegs into a wall-mounted board at child height.',
      },
      {
        name: 'Child-Size Bench',
        description:
          'A small, stable bench that lets children sit comfortably while putting on or removing shoes. Look for one with storage underneath for bonus functionality.',
        category: 'furniture',
        icon: 'Armchair',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'small wooden bench kids entryway montessori',
        diyAlternative: 'Repurpose a sturdy step stool or cut the legs of an old chair to the right height.',
      },
      {
        name: 'Low Shoe Rack',
        description:
          'A small, open shoe rack or basket where the child can see and reach their shoes. Keep only the current season\'s shoes available.',
        category: 'storage',
        icon: 'Footprints',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'low shoe rack small kids entryway',
        diyAlternative: 'Use a shallow woven basket or a simple wooden tray on the floor.',
      },
      {
        name: 'Child-Height Mirror',
        description:
          'An unbreakable mirror mounted at the child\'s eye level. Acrylic or shatterproof glass is safest for young children.',
        category: 'decor',
        icon: 'ScanFace',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'shatterproof wall mirror kids height montessori',
      },
      {
        name: 'Woven Storage Basket',
        description:
          'A natural-material basket for gloves, scarves, or seasonal accessories. Woven baskets are attractive and invite the child to keep things tidy.',
        category: 'storage',
        icon: 'ShoppingBasket',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'woven storage basket natural small entryway',
      },
      {
        name: 'Entrance Mat',
        description:
          'A durable, washable mat placed inside the door for wiping feet. Choose a size the child can manage and a texture that actually cleans shoes.',
        category: 'tool',
        icon: 'RectangleHorizontal',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'washable indoor entrance mat small kids',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Anchor any freestanding coat racks, shelving, or cubbies to the wall with anti-tip straps. Children may pull on these when reaching for items.',
        severity: 'critical',
        agePlanes: [],
      },
      {
        text: 'Ensure the entry area has a non-slip surface, especially if there is a hard floor that gets wet from rain or snow. A rubber-backed mat can prevent falls.',
        severity: 'important',
        agePlanes: [],
      },
      {
        text: 'Keep blind cords, curtain pulls, and dangling decorations out of reach or eliminate them entirely. These pose a serious strangulation risk for young children.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'If you use a mirror, choose shatterproof acrylic rather than glass. Mount it securely so it cannot be pulled off the wall.',
        severity: 'important',
        agePlanes: ['0-3', '3-6'],
      },
    ],
    inspirationVideos: [
      {
        videoId: 'ZPsmBj-Y6Aw',
        title: 'Designing a Home for Toddlers',
        description:
          'A walkthrough of how to set up your home environment to support toddler independence, including entryway ideas.',
        agePlanes: ['0-3', '3-6'],
      },
      {
        videoId: 'VcgKjMFIwxI',
        title: 'Your Child\'s Living Space',
        description:
          'Thoughtful ideas for creating spaces that respect the child\'s need for order, beauty, and accessibility.',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
    ],
    inspirationPhotos: [],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'A full home checklist that covers entryway setup alongside every other room.',
      },
      {
        slug: 'home-for-toddlers-design-an-environment-that-works',
        relevance: 'Practical guidance for designing spaces that truly work for young children.',
      },
      {
        slug: 'making-montessori-work-at-home',
        relevance: 'Strategies for translating Montessori classroom principles into your daily home life.',
      },
    ],
  },

  // =========================================================================
  // 2. CHILD'S ROOM
  // =========================================================================
  {
    room: 'childs_room',
    label: "Child's Room",
    icon: 'Bed',
    heroEmoji: '\u{1F6CF}\u{FE0F}',
    tagline: 'A sanctuary designed for rest, independence, and self-care',
    description:
      'The child\'s bedroom is much more than a place to sleep. It is a space for dressing, choosing, resting, and being alone. Maria Montessori emphasized that children need an environment scaled to their size, where they can act without constant adult intervention. A floor bed, low shelves, and accessible clothing give the child agency over some of the most personal parts of their day \u2014 waking, dressing, and caring for their own space.',
    designPrinciples: [
      {
        title: 'Floor Bed Accessibility',
        description:
          'A bed on or near the floor allows even the youngest child to get in and out independently, fostering autonomy from the very start of each day.',
        icon: 'Bed',
      },
      {
        title: 'Minimal Clutter',
        description:
          'Fewer items, thoughtfully chosen and beautifully arranged, invite deeper engagement. Rotate rather than accumulate. The child\'s mind needs visual calm.',
        icon: 'Sparkles',
      },
      {
        title: 'Child-Level Storage',
        description:
          'When clothing, books, and personal items are within reach, the child learns to dress themselves, choose a book, and tidy up \u2014 building competence and dignity.',
        icon: 'Archive',
      },
    ],
    quickWins: [
      'Lower the clothing rod in the closet (or add a tension rod) so your child can reach their own clothes',
      'Create a cozy reading nook on the floor with a few cushions and a small basket of books',
      'Rotate toys and materials \u2014 put half away and swap them every two to three weeks to renew interest',
    ],
    setupTips: [
      {
        text: 'Use a floor bed or a mattress on a low frame so your child can get in and out freely. This respects their natural sleep rhythms and builds confidence from infancy.',
        icon: 'Bed',
        agePlanes: ['0-3', '3-6'],
        priority: 'essential',
      },
      {
        text: 'Place a low, open bookshelf or forward-facing book display where your child can see covers and choose independently. Rotate a small selection rather than overcrowding the shelf.',
        icon: 'BookOpen',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Hang artwork, photographs, or nature prints at the child\'s eye level \u2014 not the adult\'s. Frame real art or your child\'s own creations. Change them periodically to keep the space fresh.',
        icon: 'Frame',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Create a dress-yourself station: a low clothing rod or hooks with a small selection of weather-appropriate outfits, plus a basket for dirty laundry. Limit choices to two or three outfits to prevent overwhelm.',
        icon: 'Shirt',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Set up a forward-facing book display or low shelf so your child sees the covers of books rather than just spines. This invites even non-readers to choose a book independently.',
        icon: 'Library',
        agePlanes: ['0-3', '3-6'],
        priority: 'recommended',
      },
      {
        text: 'Use soft, warm lighting rather than harsh overhead fixtures. A small lamp on a low table or a dimmable wall light gives the child some control over their own environment.',
        icon: 'Lamp',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Limit visible toys and materials to five or six at a time, displayed on a low shelf with clear spacing between items. This invites purposeful selection rather than chaotic play.',
        icon: 'LayoutGrid',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Include a small mirror near the dressing area so your child can see themselves while getting ready. This encourages body awareness and self-care.',
        icon: 'ScanFace',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'For older children, provide a desk or workspace in their room where they can read, write, draw, or work on personal projects in a quiet, private space.',
        icon: 'PenTool',
        agePlanes: ['6-9', '9-12', '12+'],
        priority: 'recommended',
      },
      {
        text: 'Add a small rug or soft mat beside the bed to define the sleeping area and give bare feet a warm landing in the morning.',
        icon: 'Square',
        agePlanes: [],
        priority: 'nice_to_have',
      },
    ],
    recommendedItems: [
      {
        name: 'Floor Bed Frame',
        description:
          'A low wooden bed frame that sits just a few inches off the floor, allowing the child to climb in and out safely and independently. House-style frames are popular but a simple slatted base works just as well.',
        category: 'furniture',
        icon: 'Bed',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$$',
        searchQuery: 'montessori floor bed frame toddler low wooden',
        diyAlternative: 'Place a crib mattress directly on the floor, or build a simple pallet frame from sanded lumber.',
      },
      {
        name: 'Low Open Bookshelf',
        description:
          'A sturdy, child-height shelf (two or three tiers) for displaying books with covers facing forward. This invites browsing and independent selection.',
        category: 'furniture',
        icon: 'BookOpen',
        agePlanes: [],
        priceRange: '$$',
        searchQuery: 'montessori bookshelf front facing kids low wooden',
        diyAlternative: 'Mount shallow ledge shelves (like spice racks) on the wall at child height.',
      },
      {
        name: 'Child-Height Art Display',
        description:
          'A simple wire, clip rail, or set of frames mounted at the child\'s eye level for displaying artwork, photos, or nature prints that can be changed easily.',
        category: 'decor',
        icon: 'Frame',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'kids art display wire clip rail wall mount',
        diyAlternative: 'String a piece of twine between two hooks and use clothespins to hang artwork.',
      },
      {
        name: 'Low Clothing Rack',
        description:
          'A small, freestanding clothing rack or a tension rod installed low in the closet, allowing the child to see and reach their own clothing.',
        category: 'furniture',
        icon: 'Shirt',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'kids clothing rack low montessori wooden',
        diyAlternative: 'Install a tension rod at child height inside the closet, or attach hooks at a low level on the wall.',
      },
      {
        name: 'Toy Rotation Shelf',
        description:
          'An open, low shelf unit with wide compartments for displaying a curated selection of activities. Each material sits on its own tray or in its own space.',
        category: 'storage',
        icon: 'LayoutGrid',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'montessori toy shelf open low kids storage',
      },
      {
        name: 'Soft Area Rug',
        description:
          'A natural-fiber or washable rug placed beside the bed and in the play area. Defines spaces and provides warmth underfoot.',
        category: 'decor',
        icon: 'Square',
        agePlanes: [],
        priceRange: '$$',
        searchQuery: 'washable kids area rug soft natural fiber',
      },
      {
        name: 'Basket Organizers',
        description:
          'Small, natural woven baskets for grouping items such as socks, hair accessories, or art supplies. Baskets are beautiful, functional, and invite tidying.',
        category: 'storage',
        icon: 'ShoppingBasket',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'small woven storage baskets natural kids organizer',
      },
      {
        name: 'Soft Nightlight',
        description:
          'A warm-toned, dimmable nightlight or small lamp that the child can turn on and off independently. Avoid bright blue-light devices near the sleeping area.',
        category: 'decor',
        icon: 'Lamp',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'warm nightlight kids dimmable soft glow',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Anchor every piece of furniture \u2014 bookshelves, dressers, and wardrobes \u2014 to the wall with anti-tip hardware. This is the single most important safety step in a child\'s room.',
        severity: 'critical',
        agePlanes: [],
      },
      {
        text: 'Install window guards or window stops on any window the child can reach. Windows should not open more than four inches.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Use cordless window coverings or secure all blind cords completely out of reach. Corded blinds are a leading cause of strangulation injuries in young children.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Cover all unused electrical outlets with tamper-resistant covers or install tamper-resistant receptacles, especially near the floor bed where a child might explore.',
        severity: 'important',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Choose non-toxic, low-VOC paints, finishes, and materials for all furniture and decor. Young children spend many hours in their rooms and are especially vulnerable to off-gassing chemicals.',
        severity: 'important',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'If using a floor bed, ensure the mattress fits snugly against any frame with no gaps where a child could become trapped. Remove soft bedding, pillows, and stuffed animals from the sleep area for infants.',
        severity: 'critical',
        agePlanes: ['0-3'],
      },
    ],
    inspirationVideos: [
      {
        videoId: 'ZPsmBj-Y6Aw',
        title: 'Designing a Home for Toddlers',
        description:
          'Tour a Montessori-inspired toddler home that demonstrates floor beds, low shelves, and child-accessible room layouts.',
        agePlanes: ['0-3', '3-6'],
      },
      {
        videoId: '_AaPNJcE_eA',
        title: 'Montessori Bedroom Setup',
        description:
          'A detailed look at setting up a child\'s room with intention \u2014 from toy rotation to clothing independence.',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
    ],
    inspirationPhotos: [
      {
        src: '/images/environment/floor-bed.jpg',
        alt: 'Montessori floor bed in a child\'s room',
        caption: 'A floor bed empowers even the youngest child to get in and out of bed independently, fostering autonomy from the very start.',
        agePlanes: [],
      },
    ],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'Includes a detailed bedroom checklist covering floor beds, shelving, and clothing setup.',
      },
      {
        slug: 'home-for-toddlers-design-an-environment-that-works',
        relevance: 'Specific guidance on room design for the youngest children, including sleep spaces.',
      },
      {
        slug: 'thoughts-on-your-child-s-living-space',
        relevance: 'Reflections on how the physical space shapes the child\'s sense of self and capability.',
      },
      {
        slug: 'notes-from-the-hive-honey-bees-help-us-prepare-our-home-environment',
        relevance: 'Inspiration for preparing beautiful, orderly spaces that nurture the child\'s development.',
      },
    ],
  },

  // =========================================================================
  // 3. KITCHEN
  // =========================================================================
  {
    room: 'kitchen',
    label: 'Kitchen',
    icon: 'UtensilsCrossed',
    heroEmoji: '\u{1F37D}\u{FE0F}',
    tagline: 'Where practical life begins \u2014 cooking, cleaning, and contributing',
    description:
      'Maria Montessori considered practical life activities the foundation of all learning. The kitchen is where these activities happen most naturally: pouring, slicing, mixing, setting the table, washing dishes, and sweeping the floor. When children participate in real meal preparation and cleanup, they develop concentration, fine motor control, sequencing ability, and a deep sense of belonging in the family. The goal is not perfection but participation.',
    designPrinciples: [
      {
        title: 'Child Participation',
        description:
          'The kitchen should be arranged so the child can genuinely contribute \u2014 not just watch. This means accessible workspaces, real tools, and invitations to help.',
        icon: 'Users',
      },
      {
        title: 'Real Tools',
        description:
          'Montessori encourages real, functional tools sized for small hands. A dull toy knife teaches nothing; a small, sharp-enough-to-cut knife teaches care, concentration, and capability.',
        icon: 'Utensils',
      },
      {
        title: 'Accessible Snacks & Drinks',
        description:
          'A low shelf or cabinet stocked with healthy snacks and a small pitcher of water gives the child autonomy over basic nourishment and reduces power struggles around food.',
        icon: 'Apple',
      },
    ],
    quickWins: [
      'Place a sturdy step stool or learning tower at the kitchen counter so your child can work alongside you',
      'Move a set of child-friendly dishes and cups to a low cabinet or shelf the child can reach',
      'Create a simple snack station with two or three healthy choices in a low basket or on a low shelf',
    ],
    setupTips: [
      {
        text: 'Invest in a learning tower or sturdy step stool that brings your child safely to counter height. This is the single most transformative addition to a Montessori kitchen \u2014 it turns observers into participants.',
        icon: 'ArrowUpFromLine',
        agePlanes: ['0-3', '3-6'],
        priority: 'essential',
      },
      {
        text: 'Provide child-size utensils that are real and functional: a small whisk, wooden spoons, a spreading knife, and a vegetable peeler. Avoid flimsy plastic toys \u2014 children know the difference.',
        icon: 'Utensils',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Set up an accessible water station: a small pitcher the child can pour from and a cup they can reach independently. Start with a very small pitcher and expect spills \u2014 they are part of learning.',
        icon: 'GlassWater',
        agePlanes: ['0-3', '3-6'],
        priority: 'essential',
      },
      {
        text: 'Designate a low shelf, drawer, or cabinet as the snack area. Stock it with two or three healthy options in small containers the child can open. This builds independence and reduces mealtime battles.',
        icon: 'Apple',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Invite your child into real meal preparation at their level: tearing lettuce, stirring batter, spreading butter, cracking eggs. Match the task to the child\'s skill and increase complexity over time.',
        icon: 'ChefHat',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Create a table-setting station with a placemat that shows outlines of where the plate, cup, fork, and napkin go. Even a two-year-old can set their own place with this visual guide.',
        icon: 'LayoutGrid',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Keep a child-size broom, dustpan, sponge, and spray bottle accessible so cleanup is part of the cooking process. Children take great pride in maintaining their workspace.',
        icon: 'Brush',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Start a small herb garden on the windowsill or counter. Watering, harvesting basil leaves, and adding fresh herbs to food connects the child to the full cycle of nourishment.',
        icon: 'Sprout',
        agePlanes: ['3-6', '6-9', '9-12'],
        priority: 'nice_to_have',
      },
      {
        text: 'For older children, create a recipe binder with simple, illustrated recipes they can follow independently. Laminate the pages so they survive kitchen messes.',
        icon: 'BookOpen',
        agePlanes: ['6-9', '9-12', '12+'],
        priority: 'nice_to_have',
      },
      {
        text: 'Assign your child a regular contribution to family meals \u2014 setting the table, making the salad, or pouring drinks. Consistency builds competence and a sense of responsibility.',
        icon: 'CalendarCheck',
        agePlanes: ['3-6', '6-9', '9-12', '12+'],
        priority: 'recommended',
      },
    ],
    recommendedItems: [
      {
        name: 'Learning Tower',
        description:
          'An adjustable-height platform with safety rails that brings the child to counter level. Allows participation in cooking, baking, and washing dishes safely.',
        category: 'furniture',
        icon: 'ArrowUpFromLine',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$$',
        searchQuery: 'montessori learning tower kitchen helper adjustable',
        diyAlternative: 'Build a simple kitchen helper stool from an IKEA stool with added side rails, or use a sturdy step stool with supervision.',
      },
      {
        name: 'Child-Safe Knife Set',
        description:
          'Small, real knives designed for children \u2014 wavy blades or nylon knives for beginners, progressing to small steel knives with rounded tips for older children.',
        category: 'tool',
        icon: 'Utensils',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'montessori kids knife set child safe kitchen',
      },
      {
        name: 'Small Glass Pitcher',
        description:
          'A small glass or clear plastic pitcher (about one cup capacity) for independent pouring of water, milk, or juice. Glass teaches care; start with a very small amount of liquid.',
        category: 'tool',
        icon: 'GlassWater',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$',
        searchQuery: 'small glass pitcher kids pouring montessori',
        diyAlternative: 'A small glass creamer pitcher from a thrift store works perfectly.',
      },
      {
        name: 'Child-Size Apron',
        description:
          'A simple, well-fitting apron the child can put on themselves. This signals the transition into kitchen work and protects clothing.',
        category: 'tool',
        icon: 'Shirt',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'kids cooking apron adjustable cotton child',
      },
      {
        name: 'Low Shelf or Cabinet Organizer',
        description:
          'A low, open shelf or a cabinet insert that creates a dedicated child-accessible zone for their dishes, cups, and snacks.',
        category: 'storage',
        icon: 'LayoutGrid',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'low shelf cabinet organizer kitchen kids accessible',
      },
      {
        name: 'Place Setting Placemats',
        description:
          'Fabric or laminated placemats with outlines showing where plate, cup, fork, knife, spoon, and napkin belong. Teaches table setting independently.',
        category: 'material',
        icon: 'LayoutGrid',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'montessori placemat table setting kids outline',
        diyAlternative: 'Trace your child\'s dishes onto a piece of paper, laminate it, and use it as a placemat.',
      },
      {
        name: 'Child-Size Broom and Dustpan',
        description:
          'A real (not toy) small broom and dustpan set that actually works. Children are far more engaged when tools produce real results.',
        category: 'tool',
        icon: 'Brush',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'kids broom dustpan set real small montessori',
      },
      {
        name: 'Food Preparation Tools',
        description:
          'A collection of small, functional tools: a mortar and pestle, egg slicer, small cutting board, crinkle cutter, and hand-held citrus juicer. Rotate based on current recipes.',
        category: 'tool',
        icon: 'ChefHat',
        agePlanes: ['3-6', '6-9', '9-12'],
        priceRange: '$',
        searchQuery: 'kids cooking tools real food preparation montessori',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Install stove knob covers or remove knobs when not in use. Use a stove guard to prevent pots from being pulled off burners. Never leave a child unsupervised near a hot stove.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Introduce knife skills gradually: start with a butter knife on soft foods like banana, progress to wavy nylon knives, then to small steel knives with rounded tips. Always teach proper grip and cutting-away-from-body technique.',
        severity: 'important',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Store all cleaning products, medications, and toxic substances in a locked cabinet or well out of reach. The child\'s accessible cleaning supplies should be limited to water, vinegar, and mild soap.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Secure all heavy appliances and ensure the refrigerator, oven, and dishwasher cannot be opened by young children unsupervised. Use appliance locks as needed.',
        severity: 'important',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Teach and model awareness of hot surfaces. Use consistent language like "hot \u2014 danger" and allow the child to feel warmth (not heat) near a pot so they develop a healthy respect for temperature.',
        severity: 'important',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Ensure the learning tower or step stool is stable and cannot tip. Choose models with a wide base and safety rails, and always position it on a flat, non-slip surface.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
    ],
    inspirationVideos: [],
    inspirationPhotos: [],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'Includes a kitchen checklist with specific items and layout suggestions for Montessori families.',
      },
      {
        slug: 'making-montessori-work-at-home',
        relevance: 'Covers practical life in the kitchen as a cornerstone of Montessori at home.',
      },
      {
        slug: 'montessori-materials-at-home',
        relevance: 'Guidance on choosing real, functional materials for kitchen practical life activities.',
      },
      {
        slug: 'home-for-toddlers-design-an-environment-that-works',
        relevance: 'Focuses on making the kitchen accessible and safe for the youngest family members.',
      },
    ],
  },

  // =========================================================================
  // 4. BATHROOM
  // =========================================================================
  {
    room: 'bathroom',
    label: 'Bathroom',
    icon: 'Bath',
    heroEmoji: '\u{1FAA5}',
    tagline: 'Building self-care routines with confidence and dignity',
    description:
      'The bathroom is where some of the most intimate and important independence skills develop: hand washing, tooth brushing, toileting, and bathing. Montessori reminds us that these acts are not chores to rush through but opportunities for the child to care for their own body with dignity and competence. When we prepare the bathroom thoughtfully, routines become smoother, power struggles diminish, and the child grows in self-respect.',
    designPrinciples: [
      {
        title: 'Independence in Hygiene',
        description:
          'The child should be able to wash hands, brush teeth, and manage basic grooming without needing to call for help. This means tools and supplies at their level.',
        icon: 'HandMetal',
      },
      {
        title: 'Accessible Supplies',
        description:
          'Soap, toothbrush, towel, and comb should all be within the child\'s reach and clearly placed so the routine can flow without interruption or frustration.',
        icon: 'PackageOpen',
      },
      {
        title: 'Dignity in Toileting',
        description:
          'Whether using a small potty or a toilet seat reducer, the child should feel safe, unhurried, and respected. The environment should support the process without shame.',
        icon: 'Heart',
      },
    ],
    quickWins: [
      'Place a sturdy step stool at the bathroom sink so your child can reach the faucet and mirror independently',
      'Move your child\'s toothbrush, toothpaste, and cup to a low shelf or caddy they can access without help',
      'Set up a simple potty station with a small potty or toilet seat adapter, a basket of clean underwear, and a few books nearby',
    ],
    setupTips: [
      {
        text: 'Place a wide, sturdy step stool at the sink so your child can reach the faucet, soap, and mirror without assistance. Ensure it has non-slip feet and a wide enough platform for comfortable standing.',
        icon: 'ArrowUpFromLine',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Mount or place a small mirror at the child\'s eye level (when standing on the step stool). Seeing their own face while washing and brushing makes these activities more engaging and purposeful.',
        icon: 'ScanFace',
        agePlanes: ['0-3', '3-6'],
        priority: 'recommended',
      },
      {
        text: 'Hang towels and washcloths on low hooks the child can reach \u2014 not on a high towel bar. Use a single hook per child so each person knows which towel is theirs.',
        icon: 'Shirt',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Provide a child-friendly soap dispenser: a small pump bottle that little hands can press, or a foaming dispenser that requires less pressure. Place it at the edge of the sink within reach.',
        icon: 'Droplets',
        agePlanes: ['0-3', '3-6'],
        priority: 'recommended',
      },
      {
        text: 'Set up the potty area thoughtfully: a small potty or a sturdy toilet seat reducer with a step stool, a small basket of clean underwear or training pants, and a few calm books nearby. Keep the area private and pressure-free.',
        icon: 'Baby',
        agePlanes: ['0-3', '3-6'],
        priority: 'essential',
      },
      {
        text: 'Encourage bath time independence gradually: provide a non-slip mat, a small basket of bath supplies the child can reach, and teach them to wash their own body parts in sequence.',
        icon: 'Bath',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Create a simple hand-washing station with a step, soap, towel, and a visual sequence card (wet, soap, scrub, rinse, dry) for young children who are learning the routine.',
        icon: 'HandMetal',
        agePlanes: ['0-3', '3-6'],
        priority: 'recommended',
      },
      {
        text: 'For older children, provide a grooming basket with their own comb, brush, hair ties, and lip balm. This encourages personal care responsibility and daily routine ownership.',
        icon: 'Sparkles',
        agePlanes: ['6-9', '9-12', '12+'],
        priority: 'nice_to_have',
      },
    ],
    recommendedItems: [
      {
        name: 'Bathroom Step Stool',
        description:
          'A wide, stable step stool with non-slip surface and feet. Choose one tall enough for your child to comfortably reach the faucet and see the mirror.',
        category: 'furniture',
        icon: 'ArrowUpFromLine',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'kids bathroom step stool wide non-slip sturdy',
      },
      {
        name: 'Child-Height Mirror',
        description:
          'A small, shatterproof mirror that can be wall-mounted or placed on a shelf at the child\'s standing eye level. Essential for tooth brushing and face washing.',
        category: 'decor',
        icon: 'ScanFace',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$',
        searchQuery: 'small shatterproof wall mirror kids bathroom',
      },
      {
        name: 'Low Towel Hooks',
        description:
          'Simple hooks mounted at the child\'s height for their towel and washcloth. Adhesive hooks work well for renters and can be repositioned as the child grows.',
        category: 'furniture',
        icon: 'Hook',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'adhesive towel hooks kids height bathroom wall',
        diyAlternative: 'Use removable adhesive hooks from any hardware store, placing them at the child\'s shoulder height.',
      },
      {
        name: 'Foaming Soap Dispenser',
        description:
          'A small, easy-to-press foaming soap dispenser that a young child can operate independently. Foaming soap requires less water to rinse and is easier for small hands.',
        category: 'tool',
        icon: 'Droplets',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$',
        searchQuery: 'foaming soap dispenser small kids hand pump',
      },
      {
        name: 'Potty or Toilet Seat Reducer',
        description:
          'Either a standalone small potty or a padded seat reducer that fits over the regular toilet, paired with a step stool. Choose whichever your child feels most comfortable with.',
        category: 'furniture',
        icon: 'Baby',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$',
        searchQuery: 'kids potty training toilet seat reducer step stool',
      },
      {
        name: 'Small Laundry Basket',
        description:
          'A lightweight, child-size laundry basket placed in the bathroom so the child can put dirty clothes directly in it before bath time.',
        category: 'storage',
        icon: 'ShoppingBasket',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'small laundry basket kids lightweight bathroom',
        diyAlternative: 'Use any small basket or bin with handles that the child can carry to the laundry area.',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Never leave a young child unsupervised in the bathtub, even for a moment. Drowning can occur in as little as one inch of water. Bring everything you need into the bathroom before bath time begins.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Set your water heater to 120 degrees Fahrenheit (49 degrees Celsius) or lower to prevent scalding. Consider installing anti-scald devices on faucets, especially in the bathtub.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Store all medications, vitamins, cleaning products, and sharp grooming tools (razors, scissors) in a locked cabinet or well out of the child\'s reach.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Use non-slip mats both inside the bathtub and on the floor beside it. Wet bathroom floors are a significant fall hazard for children and adults alike.',
        severity: 'important',
        agePlanes: [],
      },
      {
        text: 'Ensure the toilet lid stays closed when not in use, especially with toddlers. Consider a toilet lock if your child is in the exploring-everything phase.',
        severity: 'important',
        agePlanes: ['0-3'],
      },
    ],
    inspirationVideos: [],
    inspirationPhotos: [],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'Includes bathroom setup details for fostering hygiene independence at every age.',
      },
      {
        slug: 'home-for-toddlers-design-an-environment-that-works',
        relevance: 'Covers toileting and hygiene environment design for toddlers specifically.',
      },
      {
        slug: 'making-montessori-work-at-home',
        relevance: 'Practical strategies for building self-care routines that stick.',
      },
    ],
  },

  // =========================================================================
  // 5. LIVING / LEARNING SPACE
  // =========================================================================
  {
    room: 'living_learning',
    label: 'Living & Learning Space',
    icon: 'BookOpen',
    heroEmoji: '\u{1F4DA}',
    tagline: 'The heart of the home \u2014 where curiosity and concentration thrive',
    description:
      'In a Montessori home, the living room is not off-limits to children \u2014 it is shared, prepared, and alive with possibility. This is where the child chooses work from a shelf, unrolls a rug, and concentrates deeply. It is where the family reads together, where nature treasures are displayed, and where art and music are part of daily life. The prepared environment here does not mean a classroom replica; it means a beautiful, orderly space where children and adults coexist with mutual respect.',
    designPrinciples: [
      {
        title: 'Prepared Environment',
        description:
          'A curated selection of activities displayed on open shelves, organized from simple to complex, left to right. Each item has a purpose and a place.',
        icon: 'LayoutGrid',
      },
      {
        title: 'Beauty and Order',
        description:
          'Montessori believed that beauty calls to the child\'s spirit. Real plants, natural materials, uncluttered surfaces, and harmonious colors create a space that invites concentration.',
        icon: 'Sparkles',
      },
      {
        title: 'Freedom of Movement',
        description:
          'The child should be able to move freely between activities \u2014 choosing work, carrying it to a table or rug, completing it, and returning it. Clear pathways and open floor space support this flow.',
        icon: 'Move',
      },
    ],
    quickWins: [
      'Clear one low shelf and place three to five thoughtfully chosen activities on it, spaced apart so each one is inviting',
      'Designate a floor area where your child can unroll a work mat or rug for activities \u2014 this defines their workspace',
      'Create a cozy reading corner with a few cushions, good light, and a small basket of books rotated weekly',
    ],
    setupTips: [
      {
        text: 'Set up one or two low, open shelves with a limited number of activities (five to eight). Space items apart so each one is clearly visible and inviting. Rotate materials every two to three weeks to maintain interest.',
        icon: 'LayoutGrid',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Provide a child-size table and one or two chairs as a dedicated workspace. This is where your child will do puzzles, art, practical life activities, and eventually homework.',
        icon: 'Table',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'essential',
      },
      {
        text: 'Set up a simple art station: a small easel or a designated spot at the table with a tray of paper, crayons, watercolors, and scissors. Having art always available invites creative expression.',
        icon: 'Palette',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Create a dedicated reading corner with comfortable seating on the floor (cushions or a small chair), good natural or warm artificial light, and a forward-facing book display or basket.',
        icon: 'BookOpen',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Set up a nature table or tray: a small area where the child can display treasures found outdoors \u2014 interesting rocks, shells, leaves, pinecones. Add a magnifying glass for closer investigation.',
        icon: 'Leaf',
        agePlanes: [],
        priority: 'recommended',
      },
      {
        text: 'Include a music area with a few real instruments the child can explore freely: a small xylophone, rhythm sticks, a triangle, a rain stick, or a kalimba. Keep them accessible on a low shelf.',
        icon: 'Music',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'nice_to_have',
      },
      {
        text: 'Introduce sensorial materials appropriate to the age: stacking and nesting toys for infants, color tablets and sound cylinders for preschoolers, geometric solids for elementary children.',
        icon: 'Shapes',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Provide two or three work rugs or mats that the child can unroll on the floor to define their personal workspace. This teaches respect for one\'s own work and the work of others.',
        icon: 'Square',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Display activities on individual trays so the child can carry everything needed for an activity to their workspace in one trip. This builds independence and organizational thinking.',
        icon: 'Package',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'For older children, create a research corner with reference books, a globe, maps, and a journal for recording observations and questions. This supports the reasoning mind of the second plane.',
        icon: 'Globe',
        agePlanes: ['6-9', '9-12', '12+'],
        priority: 'nice_to_have',
      },
    ],
    recommendedItems: [
      {
        name: 'Montessori Activity Shelf',
        description:
          'A low, open shelf unit (two to three tiers, no doors) in natural wood. Wide compartments allow materials to be displayed with breathing room between them.',
        category: 'furniture',
        icon: 'LayoutGrid',
        agePlanes: [],
        priceRange: '$$',
        searchQuery: 'montessori toy shelf open low natural wood kids',
        diyAlternative: 'A simple two-tier bookcase laid on its side, or sturdy wooden crates arranged horizontally.',
      },
      {
        name: 'Child-Size Table and Chairs',
        description:
          'A sturdy, lightweight table and one or two chairs sized so the child\'s feet touch the floor when seated. Natural wood is ideal, but any durable material works.',
        category: 'furniture',
        icon: 'Table',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids wooden table chairs set montessori toddler',
      },
      {
        name: 'Work Rug',
        description:
          'A small, rollable rug or mat (approximately two by three feet) that the child places on the floor to define their work area. Having a defined space teaches focus and boundaries.',
        category: 'material',
        icon: 'Square',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'montessori work rug mat kids activity small rollable',
        diyAlternative: 'Cut a piece of carpet remnant to size, or use a thick, solid-colored placemat.',
      },
      {
        name: 'Tabletop Art Easel',
        description:
          'A small easel that sits on the child\'s table or a standing easel at child height. A double-sided easel with a chalkboard on one side and a whiteboard or paper clip on the other is versatile.',
        category: 'material',
        icon: 'Palette',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids tabletop easel art wooden montessori',
      },
      {
        name: 'Forward-Facing Book Display',
        description:
          'A low shelf or wall-mounted rack that displays book covers face-out, inviting the child to browse and choose. Much more effective than spine-out shelving for young readers.',
        category: 'furniture',
        icon: 'BookOpen',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids book display forward facing low shelf montessori',
        diyAlternative: 'Mount shallow ledge shelves or rain gutters on the wall at child height to display books face-out.',
      },
      {
        name: 'Nature Tray',
        description:
          'A simple wooden tray where the child arranges natural objects collected from walks: stones, feathers, seed pods, shells. Include a magnifying glass for observation.',
        category: 'material',
        icon: 'Leaf',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'wooden display tray nature montessori kids',
        diyAlternative: 'Any shallow basket, wooden tray, or plate dedicated to nature finds.',
      },
      {
        name: 'Sensorial Materials Set',
        description:
          'A starter set of sensorial materials appropriate to your child\'s age: color sorting, texture boards, sound matching, or geometric puzzles. These refine the senses and build cognitive skills.',
        category: 'material',
        icon: 'Shapes',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'montessori sensorial materials set kids wooden',
      },
      {
        name: 'Practical Life Tray',
        description:
          'A small tray set up with a complete practical life activity: pouring between two small pitchers, spooning beans, threading beads, or polishing silver. Change the activity every week or two.',
        category: 'material',
        icon: 'Package',
        agePlanes: ['0-3', '3-6'],
        priceRange: '$',
        searchQuery: 'montessori practical life tray pouring transfer set',
        diyAlternative: 'Assemble your own from household items: two small pitchers and dried beans, a sponge and two bowls, or a button-sorting tray.',
      },
      {
        name: 'Musical Instruments Set',
        description:
          'A small collection of real, child-friendly instruments: a xylophone with removable bars, rhythm sticks, a small drum, a triangle, and egg shakers. Real instruments produce real sound and real engagement.',
        category: 'material',
        icon: 'Music',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids musical instruments set real wooden xylophone',
      },
      {
        name: 'Globe',
        description:
          'A simple, attractive globe that introduces the concept of our world. Montessori classrooms use sandpaper globes for land and water, but a standard globe sparks wonderful conversations too.',
        category: 'material',
        icon: 'Globe',
        agePlanes: ['3-6', '6-9', '9-12'],
        priceRange: '$$',
        searchQuery: 'kids globe world montessori simple colorful',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Anchor all bookshelves, shelf units, and any top-heavy furniture to the wall. Children will inevitably lean, climb, and pull on shelves when reaching for items.',
        severity: 'critical',
        agePlanes: [],
      },
      {
        text: 'Evaluate all materials for small parts based on the ages of children in the household. Items with pieces smaller than a toilet paper tube diameter are a choking hazard for children under three.',
        severity: 'critical',
        agePlanes: ['0-3'],
      },
      {
        text: 'Store art supplies thoughtfully: keep scissors with rounded tips, use washable and non-toxic paints and markers, and ensure glue and paint are closed when not in use.',
        severity: 'important',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Ensure floor space is clear of tripping hazards. Work rugs should lie flat, and materials should be returned to shelves when the child finishes. This is both a safety practice and a Montessori principle.',
        severity: 'important',
        agePlanes: [],
      },
    ],
    inspirationVideos: [
      {
        videoId: 'VcgKjMFIwxI',
        title: 'Your Child\'s Living Space',
        description:
          'Explores how to create a shared living space that honors both adult needs and the child\'s drive toward independence and meaningful work.',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        videoId: '_AaPNJcE_eA',
        title: 'Montessori Home Environment Tour',
        description:
          'A tour of a Montessori-inspired living and learning space, showing shelf setup, activity rotation, and room layout.',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
    ],
    inspirationPhotos: [
      {
        src: '/images/environment/living-room-setup.jpg',
        alt: 'Montessori-prepared living room with low shelves and child-accessible materials',
        caption: 'A living room arranged with low, open shelves gives children independent access to carefully chosen activities.',
        agePlanes: [],
      },
      {
        src: '/images/environment/play-area.jpg',
        alt: 'Dedicated play area with organized Montessori materials',
        caption: 'A clearly defined play area with a work rug and rotating selection of materials invites purposeful, concentrated activity.',
        agePlanes: [],
      },
      {
        src: '/images/environment/playroom.jpg',
        alt: 'Bright Montessori playroom with natural light and orderly shelves',
        caption: 'An orderly, uncluttered playroom with natural light supports the child\'s ability to choose, focus, and return materials with care.',
        agePlanes: [],
      },
      {
        src: '/images/environment/girl-painting.jpg',
        alt: 'Young girl painting at a child-sized easel',
        caption: 'A child-height easel with real paints and brushes lets the child explore creative expression independently.',
        agePlanes: [],
      },
      {
        src: '/images/environment/girls-art.jpg',
        alt: 'Children engaged in art activities at a low table',
        caption: 'Open-ended art materials on accessible shelves encourage self-directed creative work and collaboration.',
        agePlanes: [],
      },
      {
        src: '/images/environment/girl-reading.jpg',
        alt: 'Girl reading independently in a cozy corner',
        caption: 'A comfortable, well-lit reading corner with forward-facing book display nurtures a love of reading and independent choice.',
        agePlanes: [],
      },
      {
        src: '/images/environment/reading-nook.jpg',
        alt: 'Montessori reading nook with cushions and child-level bookshelves',
        caption: 'A dedicated reading nook with soft seating and books at the child\'s eye level creates an inviting space for literacy and quiet reflection.',
        agePlanes: [],
      },
    ],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'A comprehensive checklist for setting up the living and learning area with Montessori principles.',
      },
      {
        slug: 'thoughts-on-your-child-s-living-space',
        relevance: 'Thoughtful reflections on sharing the living space with children while maintaining order and beauty.',
      },
      {
        slug: 'montessori-materials-at-home',
        relevance: 'Detailed guidance on selecting and presenting Montessori materials in a home setting.',
      },
      {
        slug: 'making-montessori-work-at-home',
        relevance: 'Practical advice for integrating Montessori learning activities into family living spaces.',
      },
      {
        slug: 'notes-from-the-hive-honey-bees-help-us-prepare-our-home-environment',
        relevance: 'Creative inspiration for preparing a beautiful, purposeful home environment.',
      },
    ],
  },

  // =========================================================================
  // 6. OUTDOOR SPACE
  // =========================================================================
  {
    room: 'outdoor',
    label: 'Outdoor Space',
    icon: 'TreePine',
    heroEmoji: '\u{1F33F}',
    tagline: 'Nature as the ultimate classroom \u2014 fresh air, freedom, and discovery',
    description:
      'Maria Montessori wrote extensively about the child\'s need for contact with nature. She saw the outdoors not as recess from learning but as one of its richest settings. Soil, water, wind, insects, seeds, and seasons offer sensorial experiences no classroom can replicate. A prepared outdoor space does not require a large yard or expensive equipment \u2014 it requires intention: a patch of earth to dig in, water to pour, plants to tend, and the freedom to explore.',
    designPrinciples: [
      {
        title: 'Risk vs. Hazard',
        description:
          'Montessori distinguishes between healthy risk (climbing a low branch, balancing on a beam) and genuine hazard (toxic plants, unstable structures). Remove hazards; allow manageable risk.',
        icon: 'ShieldCheck',
      },
      {
        title: 'Natural Materials',
        description:
          'Favor wood, stone, water, sand, and earth over plastic. Natural materials engage more senses, weather beautifully, and connect the child to the real world.',
        icon: 'TreePine',
      },
      {
        title: 'Sensory Experiences',
        description:
          'The outdoors should engage all senses: the smell of herbs, the sound of wind chimes, the texture of bark, the sight of growing things, and the taste of a freshly picked strawberry.',
        icon: 'Eye',
      },
    ],
    quickWins: [
      'Designate a small digging area where your child can freely explore soil, worms, and roots without worrying about the garden',
      'Start a small container garden or raised bed with easy-to-grow herbs and vegetables like basil, cherry tomatoes, or sunflowers',
      'Set up a simple water play station with buckets, funnels, and cups on a warm day',
    ],
    setupTips: [
      {
        text: 'Create a mud kitchen from repurposed furniture, old pots, and utensils. This is one of the most engaging and educational outdoor setups: children pour, stir, mix, measure, and create for hours.',
        icon: 'ChefHat',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Plant a small garden bed or container garden with the child. Choose fast-growing, forgiving plants like radishes, lettuce, sunflowers, and herbs. Let the child water, weed, and harvest.',
        icon: 'Sprout',
        agePlanes: [],
        priority: 'essential',
      },
      {
        text: 'Set up a low balance beam, stepping stones, or a simple log to walk along. These challenge gross motor skills, build confidence, and provide healthy physical risk.',
        icon: 'Activity',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Provide a sand or water play area with open-ended tools: funnels, scoops, sieves, and containers of different sizes. Sand and water play supports mathematical thinking (volume, weight, flow) and sensory integration.',
        icon: 'Waves',
        agePlanes: ['0-3', '3-6', '6-9'],
        priority: 'recommended',
      },
      {
        text: 'Hang a simple bird feeder where the child can observe it from inside or outside. Keeping a bird journal or chart helps older children practice observation and recording skills.',
        icon: 'Bird',
        agePlanes: [],
        priority: 'nice_to_have',
      },
      {
        text: 'Prepare a nature walk kit: a small basket or backpack with a magnifying glass, collection bags, a sketchpad, and colored pencils. Walks become expeditions when children have tools for investigation.',
        icon: 'Backpack',
        agePlanes: ['3-6', '6-9', '9-12'],
        priority: 'recommended',
      },
      {
        text: 'Provide safe climbing opportunities appropriate to your child\'s age and ability: a low climbing triangle for toddlers, a tree with low branches for preschoolers, or a climbing wall for older children.',
        icon: 'Mountain',
        agePlanes: ['0-3', '3-6', '6-9', '9-12'],
        priority: 'nice_to_have',
      },
      {
        text: 'Set up an outdoor art station: an easel, watercolors, large paper, or chalk for drawing on pavement. Painting outdoors changes the experience entirely \u2014 different light, different subjects, more freedom.',
        icon: 'Palette',
        agePlanes: [],
        priority: 'nice_to_have',
      },
    ],
    recommendedItems: [
      {
        name: 'Child-Size Garden Tools',
        description:
          'Real, functional garden tools sized for children: a small shovel, rake, trowel, and gardening gloves. Avoid flimsy toy versions \u2014 real tools produce real results and real satisfaction.',
        category: 'tool',
        icon: 'Shovel',
        agePlanes: [],
        priceRange: '$',
        searchQuery: 'kids garden tools real metal small montessori',
        diyAlternative: 'Look for small hand trowels and forks at garden centers \u2014 adult hand tools are often the perfect size for children.',
      },
      {
        name: 'Mud Kitchen Setup',
        description:
          'An outdoor play kitchen where children can mix soil, water, leaves, and petals. Can be as simple as an old table with some pots, or a purpose-built wooden station.',
        category: 'furniture',
        icon: 'ChefHat',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids outdoor mud kitchen wooden play',
        diyAlternative: 'Repurpose an old end table or wooden crate. Add some thrifted pots, pans, muffin tins, and spoons.',
      },
      {
        name: 'Balance Beam',
        description:
          'A low, stable wooden beam (four to six inches off the ground) for walking, balancing, and building proprioceptive awareness. Can be a single plank or a set of curved and straight sections.',
        category: 'furniture',
        icon: 'Activity',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$$',
        searchQuery: 'kids wooden balance beam outdoor montessori low',
        diyAlternative: 'Lay a sturdy plank (a two-by-six or a four-by-four) on the ground or on two low blocks.',
      },
      {
        name: 'Child-Size Watering Can',
        description:
          'A small, lightweight watering can that a child can fill, carry, and pour from independently. Metal or durable plastic, with a rose head for gentle watering.',
        category: 'tool',
        icon: 'Droplets',
        agePlanes: ['0-3', '3-6', '6-9'],
        priceRange: '$',
        searchQuery: 'kids small watering can metal garden child size',
      },
      {
        name: 'Magnifying Glass',
        description:
          'A real magnifying glass with a sturdy handle for examining insects, leaves, soil, and textures up close. An essential tool for nurturing the young naturalist.',
        category: 'tool',
        icon: 'Search',
        agePlanes: ['3-6', '6-9', '9-12'],
        priceRange: '$',
        searchQuery: 'kids magnifying glass real sturdy outdoor nature',
      },
      {
        name: 'Nature Journal',
        description:
          'A blank or lightly lined journal for drawing observations, pressing flowers, recording bird sightings, or writing about nature experiences. Pair with colored pencils.',
        category: 'material',
        icon: 'BookOpen',
        agePlanes: ['3-6', '6-9', '9-12', '12+'],
        priceRange: '$',
        searchQuery: 'kids nature journal blank sketch outdoor observation',
        diyAlternative: 'Staple together folded sheets of mixed paper (blank, lined, graph) inside a cardstock cover.',
      },
    ],
    safetyGuidelines: [
      {
        text: 'Apply sunscreen, provide hats, and ensure shade is available during outdoor play, especially between 10 a.m. and 4 p.m. Model sun protection as a normal part of going outside.',
        severity: 'important',
        agePlanes: [],
      },
      {
        text: 'Supervise all water play closely, regardless of the child\'s age or the depth of water. Empty buckets, tubs, and kiddie pools immediately after use. Young children can drown in just a few inches of water.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6'],
      },
      {
        text: 'Learn to identify and remove toxic or irritating plants from your outdoor space (such as foxglove, oleander, poison ivy, and lily of the valley). Teach children not to eat any plant unless a trusted adult confirms it is safe.',
        severity: 'critical',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Supervise the use of garden tools, especially those with pointed ends or blades. Teach proper handling, carrying, and storage from the very beginning \u2014 just as a Montessori classroom teaches children to carry scissors.',
        severity: 'important',
        agePlanes: ['0-3', '3-6', '6-9'],
      },
      {
        text: 'Check outdoor structures regularly for stability, sharp edges, splinters, and wear. Wooden equipment should be sanded smooth and inspected for rot. Ensure climbing structures are on soft surfaces like mulch or grass.',
        severity: 'important',
        agePlanes: [],
      },
    ],
    inspirationVideos: [],
    inspirationPhotos: [
      {
        src: '/images/environment/boy-outdoor.jpg',
        alt: 'Boy exploring nature in an outdoor Montessori environment',
        caption: 'Time outdoors connects the child to the natural world, building observation skills, gross motor strength, and a sense of wonder.',
        agePlanes: [],
      },
    ],
    relatedArticles: [
      {
        slug: 'a-montessori-inspired-home-room-by-room-checklist',
        relevance: 'Includes outdoor environment considerations as part of the whole-home checklist.',
      },
      {
        slug: 'making-montessori-work-at-home',
        relevance: 'Discusses the importance of outdoor time and nature connection in the Montessori home.',
      },
      {
        slug: 'montessori-materials-at-home',
        relevance: 'Natural materials and outdoor tools are among the most valuable Montessori materials.',
      },
      {
        slug: 'notes-from-the-hive-honey-bees-help-us-prepare-our-home-environment',
        relevance: 'Nature-inspired approaches to preparing the environment, including outdoor spaces.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Retrieve the guide for a specific room type.
 */
export function getRoomGuide(room: RoomType): RoomGuide | undefined {
  return ROOM_GUIDES.find((guide) => guide.room === room)
}

/**
 * Retrieve all room guides with their sub-items filtered to a specific age plane.
 * Items with an empty agePlanes array are included for all ages.
 */
export function getRoomGuidesForAge(agePlane: AgePlane): RoomGuide[] {
  return ROOM_GUIDES.map((guide) => ({
    ...guide,
    setupTips: guide.setupTips.filter(
      (tip) => tip.agePlanes.length === 0 || tip.agePlanes.includes(agePlane)
    ),
    recommendedItems: guide.recommendedItems.filter(
      (item) => item.agePlanes.length === 0 || item.agePlanes.includes(agePlane)
    ),
    safetyGuidelines: guide.safetyGuidelines.filter(
      (sg) => sg.agePlanes.length === 0 || sg.agePlanes.includes(agePlane)
    ),
    inspirationVideos: guide.inspirationVideos.filter(
      (video) => video.agePlanes.length === 0 || video.agePlanes.includes(agePlane)
    ),
    inspirationPhotos: guide.inspirationPhotos.filter(
      (photo) => photo.agePlanes.length === 0 || photo.agePlanes.includes(agePlane)
    ),
  }))
}

/**
 * Return all available room types.
 */
export function getAllRoomTypes(): RoomType[] {
  return ROOM_GUIDES.map((guide) => guide.room)
}
