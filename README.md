# Livra

Livra creates real-time **AI Brand Heroes** that officially represent your brand across digital channels.

They generate on-brand content in the moment — reacting to timing, trends, campaigns, and real-world context.

> **We turn a static logo into a living, breathing digital representative.**

🚫 **Not a content generator.**
✅ **A living brand ambassador.**

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the required values. See `ENV_SETUP.md` for details.

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Run Inngest Dev Server

Inngest handles the autonomous lifecycle workflows. In a **separate terminal**, run:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

This will:
- Start the Inngest Dev Server at [http://localhost:8288](http://localhost:8288)
- Connect to your Next.js app's Inngest endpoint
- Allow you to monitor and trigger lifecycle events

**Inngest Dashboard:** [http://localhost:8288](http://localhost:8288)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── inngest/          # Inngest functions (lifecycle workflows)
├── lib/              # Utilities (db, auth, image generation)
└── mastra/           # AI Agent configuration (Life Director)
```

## Tech Stack

- **Next.js 15** (App Router)
- **Mastra** (Agentic Framework)
- **Inngest** (Durable Workflows)
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Prisma** (ORM)
- **Gemini 2.0 Flash** (LLM)
- **Nano Banana Pro** (Image Generation)

## Documentation

- [Project Specification](./dwme_specs.md) - Full technical specification
- [Environment Setup](./ENV_SETUP.md) - Environment variables guide
- [Tasks](./TASKS.md) - Current development tasks

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Mastra Documentation](https://mastra.ai/docs)
- [Supabase Documentation](https://supabase.com/docs)
