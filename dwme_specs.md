# Project Specification: Livra

## 1. Executive Summary
**Livra** (livra.cc) is a platform for creating **autonomous AI avatars** — digital entities that live their own 24/7 life cycle. Users define the "seed" (location, budget, style, personality, and physical appearance), and the system takes over, simulating an autonomous existence.

The platform supports multiple avatar types (Personas), with **Lifestyle Influencer** being the flagship use case. Other persona types include Models, and the architecture is designed to support future expansions (Companions, Brand Ambassadors, Virtual Assistants, etc.).

The app generates real-time, context-aware photos (via Nano Banana Pro) and videos (via Veo3.1) that reflect the avatar's daily activities, budget constraints, and real-world trends.

## 2. Technical Stack (The "Agentic Monolith")
- **Framework:** Next.js 15 (App Router)
- **Agentic Framework:** Mastra (for Agent logic, Tools, and Workflows)
- **Durable Workflows:** Inngest (for the 24/7 autonomous loop and `step.sleep` functionality)
- **Database & Auth:** Supabase (PostgreSQL) + Prisma ORM
- **Storage:** Supabase Storage (storing the 14-slot Reference Stack)
- **AI Models:**
    - **Visuals (Images):** Nano Banana Pro (supporting 14 reference images)
    - **Visuals (Video):** Veo3.1 (Image-to-Video with First/Last frame control)
    - **LLM (Brain):** Gemini 2.0 Flash (via Mastra)

## 3. Database Schema (Prisma)
```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String    @id @default(uuid())
  email       String    @unique
  name        String?
  createdAt   DateTime  @default(now())
  personas    Persona[]
}

model Persona {
  userId          String
  id              String   @id @default(uuid())
  type            String   @default("INFLUENCER") // "INFLUENCER", "MODEL", etc.
  name            String
  country         String
  city            String
  neighborhood    String?
  apartmentStyle  String
  currentBalance  Float    @default(5000)
  personalityVibe String   // e.g., "Minimalist Glam", "Streetwear Rebel"
  gender          String   @default("female") // "male" or "female"
  isActive        Boolean  @default(false)
  
  // Appearance
  hairColor       String   @default("brown")
  hairStyle       String   @default("long")
  eyeColor        String   @default("brown")
  skinTone        String   @default("medium")
  lipStyle        String   @default("natural")
  facialHair      String   @default("none")    // for males
  features        String[] // freckles, glasses, dimples, etc.
  bodyHeight      String   @default("average")
  bodyType        String   @default("slim")
  
  // Clothing Style Preferences
  clothingStyle   String   @default("casual")
  bottomwear      String[]
  footwear        String[]
  signatureItems  String[]
  
  // The 14-Slot Asset Management
  faceReferences  String[] // URLs to master face images
  roomReferences  String[] // URLs to persona's apartment shots
  
  posts           Post[]
  memories        Memory[]
  lifecycleStartedAt DateTime?
  
  // Real-time Activity Tracking
  lifecycleStatus   String   @default("new")     // "new" | "running" | "paused"
  currentActivity   String?                      // "sleeping" | "planning" | "creating" | "active"
  activityDetails   String?                      // Human-readable description
  activityStartedAt DateTime?
  
  // Daily Outfit (persists through the day)
  dailyOutfit       Json?
  dailyOutfitDate   DateTime?
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  
  @@index([userId])
}

model Post {
  id        String   @id @default(uuid())
  personaId String
  persona   Persona  @relation(fields: [personaId], references: [id])
  type      String   // "IMAGE" or "VIDEO"
  contentUrl String
  caption    String
  prompt     String?
  postedAt   DateTime @default(now())
}

model Memory {
  id          String   @id @default(uuid())
  personaId   String
  persona     Persona  @relation(fields: [personaId], references: [id])
  description String   // Short-term memory of recent events
  importance  Int      @default(1)
  createdAt   DateTime @default(now())
}

model AvatarLibrary {
  id          String   @id @default(uuid())
  url         String
  gender      String?
  hairColor   String?
  hairStyle   String?
  eyeColor    String?
  skinTone    String?
  lipStyle    String?
  features    String[]
  bodyHeight  String?
  bodyType    String?
  usedBy      String[]
  createdAt   DateTime @default(now())
}
```

## 4. Mastra Agent Configuration: "The Life Director"
The core agent manages the persona's decisions and autonomous behavior.

### Core Tools:
- `getWeather(city)`: Fetches real-time weather.
- `getTrends(city)`: Fetches local trending topics (JIT context).
- `generateImage(prompt, refs)`: Interface for Nano Banana Pro API.
- `generateVideo(firstFrame, lastFrame, prompt)`: Interface for Veo3.1 API.
- `updateWallet(amount)`: Deducts/Adds money based on lifestyle choices.
- `createMemory(description)`: Creates short-term memories for the persona.

## 5. Durable Workflow (Inngest)
The life cycle is orchestrated via Inngest to handle long-running processes:

1. **Cycle Trigger:** `livra/lifecycle.start`
2. **Step: Environmental Check:** Fetch weather and local trends for persona's city.
3. **Step: Daily Outfit Selection:** Generate outfit based on weather, time of day, and style preferences.
4. **Step: Daily Plan:** Mastra Agent decides on the next activity based on persona's personality and context.
5. **Step: Production (Image):**
    - Query DB for 14 best references (Face + Room).
    - Call Nano Banana Pro API.
    - Save to `Post` table.
6. **Step: Sleep:** `step.sleep("4 to 8 hours")`.
7. **Step: Production (Video):**
    - Generate First Frame (NB Pro).
    - Generate Last Frame (NB Pro) using First Frame as a reference.
    - Call Veo3.1 for interpolation.

## 6. Media Pipeline Logic
### Nano Banana Pro Integration:
- The system must intelligently fill **14 slots**:
    - Slots 1-6: Physical face/body consistency.
    - Slots 7-12: Environment/Location consistency.
    - Slots 13-14: Object/Clothing consistency.

### Veo3.1 Integration:
- Implementation of **First Frame / Last Frame** logic.
- Agent ensures that the `last_frame` prompt includes continuity markers from the `first_frame`.

## 7. UI/UX Requirements
- **Dashboard:** Management panel for all personas (cards with status).
- **Timeline View:** Activity-based feed showing daily life simulation.
- **Onboarding Flow:** 1. World -> 2. Persona Profile -> 3. Style -> 4. Wealth -> 5. Avatar Generation.
- **Real-time:** Supabase Realtime for automatic status updates.
- **Play/Pause Controls:** Start and pause persona lifecycle.

## 8. Persona Types

### Currently Supported:
| Type | Description | Use Case |
|------|-------------|----------|
| **INFLUENCER** | Lifestyle AI influencer | Social media simulation, content generation |
| **MODEL** | AI fashion/photo model | Photoshoot simulation, lookbook generation |

### Planned (Future):
| Type | Description | Use Case |
|------|-------------|----------|
| **COMPANION** | Virtual AI companion | Personal interaction, emotional AI |
| **AMBASSADOR** | Brand ambassador | Product placement, promotional content |
| **CREATOR** | Content creator | Blog posts, tutorials, creative content |

## 9. Platform Roadmap (Progressive Development)

### Phase 1: Private Personas (MVP) ✅
- Users create and manage **private AI personas**
- Full control over generation, content, and visibility
- Personal entertainment / experimentation use case
- Persona states: `new`, `running`, `paused`
- **Flagship use case:** Lifestyle Influencer

### Phase 2: Public Sharing
- **Visibility modes:** Private (default) | Public | Unlisted
- Public personas visible on platform's discovery feed
- Followers can "observe" persona's simulated life
- Export to external platforms (Instagram, TikTok, X) for promotion

### Phase 3: Creator Economy & Monetization

#### User Roles:
- **Creators:** Build & manage AI personas, monetize content
- **Observers:** Follow public personas, consume content, interact

#### Revenue Streams:
- **UGC Ads / Product Placement:** Brands pay creators to feature products in generated content
- **Platform Ads:** In-feed advertising for observers
- **Subscription Tiers:** Premium features for creators (faster generation, more personas)
- **Tips / Gifts:** Observers can tip popular creators

#### Creator Dashboard:
- Analytics: views, followers, engagement
- Revenue tracking
- Brand deal management
- Content scheduling & approval

### Phase 4: Advanced Features
- Multi-persona interactions (collabs, shared events)
- Real-world brand partnerships API
- AI-generated storylines and drama arcs
- Virtual merchandise & digital assets
- New persona types (Companions, Ambassadors, etc.)