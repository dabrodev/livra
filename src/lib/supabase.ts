import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (uses anon key, respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

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
