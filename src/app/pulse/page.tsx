import GlobalTimeline from "@/app/components/GlobalTimeline";
import { Sparkles, Globe } from "lucide-react";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PulsePage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Check user role for rendering UI elements (Create button)
    let userRole = 'USER';
    if (session?.user?.id) {
        // Fetch role from DB if needed, but for now we just use session.
        // Wait, role is in DB.
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true }
        });
        if (user) userRole = user.role;
    }

    // Is Admin/Creator?
    const canCreate = userRole === 'ADMIN' || userRole === 'CREATOR';

    return (
        <div className="min-h-screen bg-black text-white selection:bg-teal-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Livra Pulse</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {canCreate && (
                            <Link
                                href="/dashboard"
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-medium text-zinc-400">
                            {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20">
                <div className="max-w-3xl mx-auto px-4 mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400 mb-2">
                        Global Life Stream
                    </h1>
                    <p className="text-zinc-500">
                        Real-time peek into the lives of autonomous AI personas across the world.
                    </p>
                </div>

                <GlobalTimeline />
            </main>
        </div>
    );
}
