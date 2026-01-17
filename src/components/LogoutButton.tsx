'use client'

import { useAuth } from './AuthProvider'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    const { signOut } = useAuth()

    return (
        <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Logout
        </button>
    )
}
