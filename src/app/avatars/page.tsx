import { prisma } from "@/lib/db";
import { Sparkles, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AvatarLibraryPage() {
    const avatars = await prisma.avatarLibrary.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">daywith.me</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Avatar Library</h1>
                        <p className="text-zinc-400 mt-1">
                            {avatars.length} avatar{avatars.length !== 1 ? "s" : ""} generated
                        </p>
                    </div>

                    {/* Empty state */}
                    {avatars.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-3xl">📚</span>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No avatars yet</h2>
                            <p className="text-zinc-400 mb-6">
                                Generate avatars for your influencers to build your library
                            </p>
                            <Link
                                href="/onboarding"
                                className="btn-glow px-5 py-2.5 rounded-full text-white font-medium inline-flex items-center gap-2"
                            >
                                Create Influencer
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Avatar grid */}
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {avatars.map((avatar) => (
                                    <div key={avatar.id} className="group relative">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatar.url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Traits badge */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-wrap gap-1">
                                                {avatar.hairColor && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700/80 rounded text-zinc-300">
                                                        {avatar.hairColor}
                                                    </span>
                                                )}
                                                {avatar.skinTone && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700/80 rounded text-zinc-300">
                                                        {avatar.skinTone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <p className="text-sm text-zinc-400">
                                    💡 These avatars are automatically available when creating new influencers.
                                    Select &quot;Browse Library&quot; during avatar creation to reuse them.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
