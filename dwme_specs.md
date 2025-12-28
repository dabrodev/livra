# Project Specification: daywith.me

## 1. Executive Summary
**daywith.me** is a lifestyle AI simulator that creates autonomous digital influencers. Users define the "seed" (location, budget, style, and physical appearance), and the system takes over, simulating a 24/7 life cycle. The app generates real-time, context-aware photos (via Nano Banana Pro) and videos (via Veo3.1) that reflect the character's daily activities, budget constraints, and real-world trends.

## 2. Technical Stack (The "Agentic Monolith")
- **Framework:** Next.js 15 (App Router)
- **Agentic Framework:** Mastra (for Agent logic, Tools, and Workflows)
- **Durable Workflows:** Inngest (for the 24/7 autonomous loop and `step.sleep` functionality)
- **Database & Auth:** Supabase (PostgreSQL) + Prisma ORM
- **Storage:** Supabase Storage (storing the 14-slot Reference Stack)
- **AI Models:**
    - **Visuals (Images):** Nano Banana Pro (supporting 14 reference images)
    - **Visuals (Video):** Veo3.1 (Image-to-Video with First/Last frame control)
    - **LLM (Brain):** GPT-4o or Claude 3.5 Sonnet (via Mastra)

## 3. Database Schema (Prisma)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Influencer {
  id              String   @id @default(uuid())
  name            String
  country         String
  city            String
  neighborhood    String?
  apartmentStyle  String
  currentBalance  Float    @default(5000)
  personalityVibe String   // e.g., "Minimalist Glam", "Streetwear Rebel"
  
  // The 14-Slot Asset Management
  faceReferences  String[] // URLs to master face images
  roomReferences  String[] // URLs to influencer's apartment shots
  
  posts           Post[]
  memories        Memory[]
  createdAt       DateTime @default(now())
}

model Post {
  id           String   @id @default(uuid())
  influencerId String
  influencer   Influencer @relation(fields: [influencerId], references: [id])
  type         String   // "IMAGE" or "VIDEO"
  contentUrl   String
  caption      String
  postedAt     DateTime @default(now())
}

model Memory {
  id           String   @id @default(uuid())
  influencerId String
  influencer   Influencer @relation(fields: [influencerId], references: [id])
  description  String   // Short-term memory of recent events
  importance   Int      @default(1)
  createdAt    DateTime @default(now())
}
```

## 4. Mastra Agent Configuration: "The Life Director"
The core agent manages the influencer's decisions.

### Core Tools:
- `getWeather(city)`: Fetches real-time weather.
- `getTrends(city)`: Fetches local trending topics (JIT context).
- `generateImage(prompt, refs)`: Interface for Nano Banana Pro API.
- `generateVideo(firstFrame, lastFrame, prompt)`: Interface for Veo3.1 API.
- `updateWallet(amount)`: Deducts/Adds money based on lifestyle choices.

## 5. Durable Workflow (Inngest)
The life cycle is orchestrated via Inngest to handle long-running processes:

1. **Cycle Trigger:** `daywithme/cycle.start`
2. **Step: Environmental Check:** Fetch weather and local trends.
3. **Step: Daily Plan:** Mastra Agent decides on the next activity.
4. **Step: Production (Image):**
    - Query DB for 14 best references (Face + Room).
    - Call Nano Banana Pro API.
    - Save to `Post` table.
5. **Step: Sleep:** `step.sleep("4 to 8 hours")`.
6. **Step: Production (Video):**
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
- **Mobile-First Design:** Vertical feed (Instagram-style).
- **Onboarding Flow:** 1. World -> 2. Persona -> 3. Wealth.
- **Real-time:** Supabase Realtime for automatic feed updates.