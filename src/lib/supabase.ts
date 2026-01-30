import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client WITH session awareness
// Uses @supabase/ssr to properly sync with auth cookies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env.local file.')
}

// Browser client that syncs with auth session from cookies
// This is required for Realtime subscriptions to work with auth
export const supabase = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        realtime: {
            timeout: 20000
        }
    }
)

// Server-side Supabase client (uses service role key if available, bypasses RLS)
// Falls back to anon client if service role key is not set
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl || '', supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : supabase // Fallback to regular client if no service key

// Storage bucket name for generated content
export const STORAGE_BUCKET = 'generated-content'
