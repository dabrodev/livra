import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Sparkles, ArrowLeft, MapPin, Wallet, Play, Pause, Download,
    Coffee, Camera, Utensils, ShoppingBag, Dumbbell, Moon, Sun,
    Activity, Zap, Heart, Home, Music, BookOpen, type LucideIcon
} from "lucide-react";

interface TimelinePageProps {
    params: Promise<{ id: string }>;
}

// Map activity keywords to icons
function getActivityIcon(description: string): LucideIcon {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('coffee') || lowerDesc.includes('cafe') || lowerDesc.includes('café')) return Coffee;
    if (lowerDesc.includes('photo') || lowerDesc.includes('content') || lowerDesc.includes('camera')) return Camera;
    if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner') || lowerDesc.includes('breakfast') || lowerDesc.includes('food') || lowerDesc.includes('restaurant')) return Utensils;
    if (lowerDesc.includes('shop') || lowerDesc.includes('boutique') || lowerDesc.includes('store')) return ShoppingBag;
    if (lowerDesc.includes('gym') || lowerDesc.includes('workout') || lowerDesc.includes('exercise') || lowerDesc.includes('yoga')) return Dumbbell;
    if (lowerDesc.includes('evening') || lowerDesc.includes('night') || lowerDesc.includes('sleep')) return Moon;
    if (lowerDesc.includes('morning') || lowerDesc.includes('woke') || lowerDesc.includes('sunrise')) return Sun;
    if (lowerDesc.includes('home') || lowerDesc.includes('apartment')) return Home;
    if (lowerDesc.includes('relax') || lowerDesc.includes('chill') || lowerDesc.includes('positive')) return Heart;
    if (lowerDesc.includes('music') || lowerDesc.includes('concert')) return Music;
    if (lowerDesc.includes('read') || lowerDesc.includes('book') || lowerDesc.includes('study')) return BookOpen;
    return Activity;
}

// Determine if activity is content-worthy based on description
function isContentActivity(description: string): boolean {
    const lowerDesc = description.toLowerCase();
    return lowerDesc.includes('photo') || lowerDesc.includes('content') ||
        lowerDesc.includes('post') || lowerDesc.includes('generated');
}

// Format time from date
function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Format relative time
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

export default async function InfluencerTimelinePage({ params }: TimelinePageProps) {
    const { id } = await params;

    const influencer = await prisma.influencer.findUnique({
        where: { id },
        include: {
            posts: {
                orderBy: { postedAt: "desc" },
                take: 10,
            },
            memories: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    if (!influencer) {
        notFound();
    }

    // Combine memories and posts into a unified timeline
    type TimelineItem = {
        id: string;
        time: Date;
        icon: LucideIcon;
        action: string;
        description: string;
        type: 'life' | 'content';
        contentUrl?: string;
        importance?: number;
    };

    const timelineItems: TimelineItem[] = [
        // Add memories
        ...influencer.memories.map(memory => ({
            id: memory.id,
            time: memory.createdAt,
            icon: getActivityIcon(memory.description),
            action: memory.description.split(' - ')[0] || memory.description.slice(0, 30),
            description: memory.description,
            type: 'life' as const,
            importance: memory.importance,
        })),
        // Add posts as content items
        ...influencer.posts.map(post => ({
            id: post.id,
            time: post.postedAt,
            icon: Camera,
            action: post.type === 'VIDEO' ? 'Video generated' : 'Photo generated',
            description: post.caption,
            type: 'content' as const,
            contentUrl: post.contentUrl,
        })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Check if there are any real activities
    const hasRealActivity = timelineItems.length > 0;

    // For demo, determine active state
    const isActive = hasRealActivity &&
        (new Date().getTime() - new Date(timelineItems[0]?.time || 0).getTime()) < 8 * 60 * 60 * 1000;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold">daywith.me</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Profile header */}
                    <div className="glass-card rounded-2xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Avatar */}
                            {influencer.faceReferences.length > 0 ? (
                                <img
                                    src={influencer.faceReferences[0]}
                                    alt={influencer.name}
                                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                                    {influencer.name.charAt(0)}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold">{influencer.name}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isActive ? "text-green-400 bg-green-400/10" : "text-zinc-400 bg-zinc-400/10"
                                        }`}>
                                        {isActive ? <Zap className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                        {isActive ? "Active" : "Idle"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {influencer.city}, {influencer.country}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Wallet className="w-3.5 h-3.5" />
                                        <span className="gradient-text font-medium">${influencer.currentBalance.toLocaleString()}</span>
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 mt-2">
                                    {influencer.personalityVibe.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} • {influencer.apartmentStyle.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2">
                                <button className={`p-3 rounded-xl transition-all ${isActive
                                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                    : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    }`}>
                                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <button className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Create Avatar Banner - show if no avatar yet */}
                    {influencer.faceReferences.length === 0 && (
                        <Link
                            href={`/influencer/${influencer.id}/avatar`}
                            className="block glass-card rounded-2xl p-6 mb-8 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">
                                        Create Your Avatar
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        Define {influencer.name}&apos;s appearance and generate AI avatar options
                                    </p>
                                </div>
                                <div className="text-purple-400">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Timeline */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {hasRealActivity ? 'Activity Timeline' : 'Waiting for First Activity'}
                        </h2>
                    </div>

                    {hasRealActivity ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                            {/* Timeline items */}
                            <div className="space-y-6">
                                {timelineItems.map((item) => {
                                    const Icon = item.icon;
                                    const isContent = item.type === "content";

                                    return (
                                        <div key={item.id} className="relative flex gap-4">
                                            {/* Icon */}
                                            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isContent
                                                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                                : item.importance && item.importance >= 4
                                                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                                                    : "bg-zinc-800"
                                                }`}>
                                                <Icon className={`w-5 h-5 ${isContent || (item.importance && item.importance >= 4) ? "text-white" : "text-zinc-400"}`} />
                                            </div>

                                            {/* Content */}
                                            <div className={`flex-1 ${isContent ? "glass-card rounded-xl p-4" : "pt-2"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-zinc-500 font-mono">
                                                        {formatRelativeTime(item.time)}
                                                    </span>
                                                    <span className={`font-medium ${isContent ? "gradient-text" : ""}`}>
                                                        {item.action}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-400">{item.description}</p>

                                                {isContent && item.contentUrl && (
                                                    <div className="mt-3 aspect-video rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                        {item.contentUrl ? (
                                                            <img src={item.contentUrl} alt="Generated content" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-zinc-600 text-sm">Generating content...</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                            <p className="text-zinc-400 text-sm max-w-md mx-auto">
                                {influencer.name}&apos;s autonomous life cycle is starting up.
                                Activities will appear here as they happen throughout the day.
                            </p>
                        </div>
                    )}

                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{influencer.posts.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Posts Generated</span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{timelineItems.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Total Activities</span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{influencer.memories.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Memories</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
