# Deployment Guide: Livra (Next.js + Inngest + Supabase)

## Architecture Overview
Moving Livra to production is simpler than it seems because we leverage managed infrastructure. You do **NOT** need to host your own Inngest server.

-   **Frontend & API (Next.js):** Hosted on **Vercel**.
-   **Database & Auth (Supabase):** Hosted on **Supabase Cloud**.
-   **Background Jobs (Inngest):** Managed by **Inngest Cloud** (SaaS).

### 💡 Key Concept: Inngest in Production
The local `npx inngest-cli dev` server is **only for local development**.
In production, you do not run a server. Instead:
1.  **Vercel** hosts your API endpoint (`/api/inngest`).
2.  **Inngest Cloud** sends HTTP requests to this endpoint to trigger functions.
3.  Your app sends events to Inngest Cloud, which then calls your functions back.

---

## Step-by-Step Deployment

### 1. Prerequisites
-   GitHub repository (Your code is already pushed).
-   Vercel account (Free tier works).
-   Inngest account (Free tier works).
-   Supabase project (Already set up).

### 2. Deploy to Vercel
1.  Log in to [Vercel](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `livra` repository from GitHub.
4.  **Environment Variables:**
    Copy all values from your local `.env.local` into the Vercel project settings:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `DATABASE_URL` (Use the Transaction Mode pooling URL from Supabase if possible, port 6543)
    -   `DIRECT_URL` (Use the Session Mode direct URL from Supabase, port 5432)
    -   `INNGEST_EVENT_KEY` (See Step 3)
    -   `INNGEST_SIGNING_KEY` (See Step 3)
    -   `GOOGLE_GENERATIVE_AI_API_KEY`
    -   `SERPAPI_API_KEY` (Optional, for trends)
5.  Click **Deploy**.

### 3. Configure Inngest Cloud
1.  Go to [Inngest Cloud](https://app.inngest.com) and create an account.
2.  Create a new Function App (or Project).
3.  **Get Keys:**
    -   Copy the **Event Key** -> Add to Vercel env as `INNGEST_EVENT_KEY`.
    -   Copy the **Signing Key** -> Add to Vercel env as `INNGEST_SIGNING_KEY`.
4.  **Redeploy Vercel:** changing env vars requires a redeploy in Vercel. Go to Deployments -> Redeploy.

### 4. Syncing & Verification
Once Vercel is deployed with the correct keys:
1.  Inngest Cloud will automatically detect your app via the `/api/inngest` endpoint if the keys match.
2.  Go to the **"Functions"** tab in Inngest Cloud. You should see `lifecycleCycle`, `startLifecycle`, etc. registered there.
3.  **Trigger a Test:** You can manually send an event from the Inngest Cloud dashboard (`Test Event` button) to start a cycle:
    -   Event Name: `livra/cycle.start`
    -   Data: `{ "personaId": "YOUR_PERSONA_ID" }`

### 5. Production Database Migrations
Ensure your production Supabase database has the schema.
from your local terminal:
```bash
npx prisma migrate deploy
```
*Note: Ensure your `.env` connects to the production DB when you run this.*

## Troubleshooting
-   **"Function not found":** Check that `INNGEST_SIGNING_KEY` is correct in Vercel.
-   **Timeouts:** Vercel serverless functions have a timeout (usually 10s or 60s). Inngest handles this by running steps independently, but ensure no single `step.run` takes longer than the Vercel limit.
