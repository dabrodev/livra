import { prisma } from "@/lib/db";
import { Sparkles, Plus, MapPin, Wallet, Camera, Moon, Zap, Play, Pause, Brain, Coffee } from "lucide-react";
import Link from "next/link";

// Lifecycle Status (user-controlled: new/running/paused)
function getLifecycleStatus(lifecycleStatus: string | null, lifecycleStartedAt: Date | null) {
    if (!lifecycleStartedAt) {
        return {
            label: "New",
            color: "text-zinc-400 bg-zinc-400/10",
            icon: Sparkles,
        };
    }
    if (lifecycleStatus === 'running') {
        return {
            label: "Running",
            color: "text-green-400 bg-green-400/10",
            icon: Play,
        };
    }
    return {
        label: "Paused",
        color: "text-orange-400 bg-orange-400/10",
        icon: Pause,
    };
}

// Activity Status (system-controlled: what avatar is doing now)
function getActivityStatus(currentActivity: string | null) {
    switch (currentActivity) {
        case 'sleeping':
            return { label: "Sleeping", color: "text-indigo-400 bg-indigo-400/10", icon: Moon };
        case 'planning':
            return { label: "Planning", color: "text-amber-400 bg-amber-400/10", icon: Brain };
        case 'creating':
            return { label: "Creating", color: "text-pink-400 bg-pink-400/10", icon: Camera };
        case 'active':
            return { label: "Active", color: "text-green-400 bg-green-400/10", icon: Zap };
        case 'resting':
            return { label: "Resting", color: "text-cyan-400 bg-cyan-400/10", icon: Coffee };
        default:
            return null;
    }
}

function StatusBadges({
    lifecycleStatus,
    lifecycleStartedAt,
    currentActivity
}: {
    lifecycleStatus: string | null;
    lifecycleStartedAt: Date | null;
    currentActivity: string | null;
}) {
    const lifecycle = getLifecycleStatus(lifecycleStatus, lifecycleStartedAt);
    const activity = lifecycleStatus === 'running' ? getActivityStatus(currentActivity) : null;
    const LifecycleIcon = lifecycle.icon;

    return (
        <div className="flex flex-col gap-1">
            {/* Primary: Lifecycle status */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${lifecycle.color}`}>
                <LifecycleIcon className="w-3 h-3" />
                {lifecycle.label}
            </span>

            {/* Secondary: Activity status (only when running) */}
            {activity && (() => {
                const ActivityIcon = activity.icon;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${activity.color}`}>
                        <ActivityIcon className="w-3 h-3" />
                        {activity.label}
                    </span>
                );
            })()}
        </div>
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">Livra</span>
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
                                const hasAvatar = influencer.faceReferences.length > 0;

                                return (
                                    <Link
                                        key={influencer.id}
                                        href={`/influencer/${influencer.id}`}
                                        className="glass-card rounded-2xl p-6 hover:border-teal-500/30 transition-all group"
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
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xl font-bold">
                                                    {influencer.name.charAt(0)}
                                                </div>
                                            )}
                                            <StatusBadges
                                                lifecycleStatus={influencer.lifecycleStatus}
                                                lifecycleStartedAt={influencer.lifecycleStartedAt}
                                                currentActivity={influencer.currentActivity}
                                            />
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-lg font-semibold group-hover:text-teal-400 transition-colors">
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
                                                <span className="text-xs px-2 py-1 rounded-full bg-teal-500/20 text-teal-400">
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
