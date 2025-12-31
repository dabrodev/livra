import { prisma } from "@/lib/db";
import { Sparkles, Plus, MapPin, Wallet, Activity, Moon, Zap, Camera } from "lucide-react";
import Link from "next/link";

type InfluencerStatus = "generating" | "sleeping" | "active" | "idle";

function getInfluencerStatus(lastActivityTime: Date | null, memoryCount: number): InfluencerStatus {
    if (memoryCount === 0) return "idle";

    if (!lastActivityTime) return "idle";

    const now = new Date();
    const diff = now.getTime() - new Date(lastActivityTime).getTime();
    const hours = diff / (1000 * 60 * 60);

    // If last activity was within 1 hour, consider generating
    if (hours < 1) return "generating";

    // If within 4 hours, active
    if (hours < 4) return "active";

    // If between 4-8 hours, sleeping
    if (hours < 8) return "sleeping";

    // Otherwise idle
    return "idle";
}

function StatusBadge({ status }: { status: InfluencerStatus }) {
    const config = {
        generating: { icon: Zap, color: "text-yellow-400 bg-yellow-400/10", label: "Generating" },
        sleeping: { icon: Moon, color: "text-blue-400 bg-blue-400/10", label: "Sleeping" },
        active: { icon: Activity, color: "text-green-400 bg-green-400/10", label: "Active" },
        idle: { icon: Activity, color: "text-zinc-400 bg-zinc-400/10", label: "Idle" },
    };

    const { icon: Icon, color, label } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

export default async function DashboardPage() {
    const influencers = await prisma.influencer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { posts: true, memories: true },
            },
            memories: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    // Get avatar library count
    const avatarCount = await prisma.avatarLibrary.count();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">daywith.me</span>
                    </Link>
                    {avatarCount > 0 && (
                        <Link
                            href="/avatars"
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            📚 Avatar Library ({avatarCount})
                        </Link>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Page header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Your Influencers</h1>
                            <p className="text-zinc-400 mt-1">Manage your AI-powered digital personas</p>
                        </div>
                        <Link
                            href="/onboarding"
                            className="btn-glow px-5 py-2.5 rounded-full text-white font-medium flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create New
                        </Link>
                    </div>

                    {/* Stats summary */}
                    {influencers.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-card rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">{influencers.length}</span>
                                <span className="text-sm text-zinc-400 block">Influencers</span>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">
                                    {influencers.reduce((sum, i) => sum + i._count.posts, 0)}
                                </span>
                                <span className="text-sm text-zinc-400 block">Total Posts</span>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">
                                    {influencers.reduce((sum, i) => sum + i._count.memories, 0)}
                                </span>
                                <span className="text-sm text-zinc-400 block">Memories Created</span>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">
                                    ${influencers.reduce((sum, i) => sum + i.currentBalance, 0).toLocaleString()}
                                </span>
                                <span className="text-sm text-zinc-400 block">Total Balance</span>
                            </div>
                        </div>
                    )}

                    {/* Influencer grid */}
                    {influencers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-zinc-600" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No influencers yet</h2>
                            <p className="text-zinc-400 mb-6">Create your first AI influencer to get started</p>
                            <Link
                                href="/onboarding"
                                className="btn-glow px-6 py-3 rounded-full text-white font-medium inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Influencer
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {influencers.map((influencer) => {
                                const lastActivity = influencer.memories[0]?.createdAt || null;
                                const status = getInfluencerStatus(lastActivity, influencer._count.memories);
                                const hasAvatar = influencer.faceReferences.length > 0;

                                return (
                                    <Link
                                        key={influencer.id}
                                        href={`/influencer/${influencer.id}`}
                                        className="glass-card rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                                    >
                                        {/* Avatar and status */}
                                        <div className="flex items-start justify-between mb-4">
                                            {hasAvatar ? (
                                                <img
                                                    src={influencer.faceReferences[0]}
                                                    alt={influencer.name}
                                                    className="w-14 h-14 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                                                    {influencer.name.charAt(0)}
                                                </div>
                                            )}
                                            <StatusBadge status={status} />
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
                                            {influencer.name}
                                        </h3>

                                        {/* Location */}
                                        <div className="flex items-center gap-1.5 text-sm text-zinc-400 mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{influencer.city}, {influencer.country}</span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Wallet className="w-3.5 h-3.5 text-zinc-500" />
                                                <span className="gradient-text font-medium">
                                                    ${influencer.currentBalance.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                                                <Camera className="w-3.5 h-3.5" />
                                                {influencer._count.posts} posts
                                            </div>
                                        </div>

                                        {/* Vibe tag + avatar indicator */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                                                {influencer.personalityVibe.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            {!hasAvatar && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                                    Needs Avatar
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
