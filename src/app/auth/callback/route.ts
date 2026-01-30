import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, error_description)
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
        )
    }

    // Exchange code for session
    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
            )
        }

        // Success - redirect to dashboard
        console.log('Successfully authenticated, redirecting to dashboard')

        // Ensure we redirect to the same domain we came from
        const origin = request.headers.get('origin') || requestUrl.origin

        // If we have a forwarded host (e.g. Vercel custom domain), use it
        const forwardedHost = request.headers.get('x-forwarded-host')
        if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}/pulse`)
        }

        return NextResponse.redirect(`${origin}/pulse`)
    }

    // No code provided
    console.error('No code provided in callback')
    return NextResponse.redirect(new URL('/login?error=no_code_provided', request.url))
}
