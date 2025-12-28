# Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# LLM Provider (for Mastra)
OPENAI_API_KEY="[YOUR-OPENAI-KEY]"
# or ANTHROPIC_API_KEY="[YOUR-ANTHROPIC-KEY]"

# Media Generation APIs
NANO_BANANA_API_KEY="[YOUR-NANO-BANANA-KEY]"
VEO_API_KEY="[YOUR-VEO-KEY]"

# Inngest
INNGEST_EVENT_KEY="[YOUR-INNGEST-KEY]"
INNGEST_SIGNING_KEY="[YOUR-INNGEST-SIGNING-KEY]"
```

## Getting the Keys

1. **Supabase**: Create project at [supabase.com](https://supabase.com), get keys from Settings > API
2. **OpenAI/Anthropic**: Get API key from respective provider dashboards
3. **Inngest**: Sign up at [inngest.com](https://inngest.com), get keys from dashboard
4. **Nano Banana / Veo**: Contact respective API providers
