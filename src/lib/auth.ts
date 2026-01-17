import { createClient } from './supabase/server'
import { prisma } from './db'

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

/**
 * Get or create a User record in the database for the authenticated Supabase user
 */
export async function getOrCreateUser() {
    const supabaseUser = await requireAuth()

    // Check if user exists in our database
    let user = await prisma.user.findUnique({
        where: { id: supabaseUser.id }
    })

    // If not, create it
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata?.name || null
            }
        })
    }

    return user
}
