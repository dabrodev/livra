import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Sparkles, ArrowLeft, MapPin, Wallet, Download, Wand2,
    Zap, Clock, Play, Pause, Moon, Brain, Camera, Coffee, Shirt
} from "lucide-react";
import ImageLightbox from "@/app/components/ImageLightbox";
import AvatarSwap from "@/app/components/AvatarSwap";
import RealtimeTimeline, { TimelineItem } from "@/app/components/RealtimeTimeline";
import LifecycleControls from "@/app/components/LifecycleControls";
import RealtimeActivityStatus from "@/app/components/RealtimeActivityStatus";

// Lifecycle Status Badge (user-controlled: new/running/paused)
function getLifecycleStatusBadge(lifecycleStatus: string | null, lifecycleStartedAt: Date | null) {
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

// Activity Status Badge (system-controlled: what avatar is doing now)
function getActivityStatusBadge(currentActivity: string | null) {
    switch (currentActivity) {
        case 'sleeping':
            return {
                label: "Sleeping",
                color: "text-indigo-400 bg-indigo-400/10",
                icon: Moon,
            };
        case 'planning':
            return {
                label: "Planning",
                color: "text-amber-400 bg-amber-400/10",
                icon: Brain,
            };
        case 'creating':
            return {
                label: "Creating",
                color: "text-pink-400 bg-pink-400/10",
                icon: Camera,
            };
        case 'active':
            return {
                label: "Active",
                color: "text-green-400 bg-green-400/10",
                icon: Zap,
            };
        case 'resting':
            return {
                label: "Resting",
                color: "text-cyan-400 bg-cyan-400/10",
                icon: Coffee,
            };
        default:
            return null;
    }
}

interface TimelinePageProps {
    params: Promise<{ id: string }>;
}

// Map activity keywords to icon names
function getActivityIconName(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('coffee') || lowerDesc.includes('cafe') || lowerDesc.includes('café')) return 'Coffee';
    if (lowerDesc.includes('photo') || lowerDesc.includes('content') || lowerDesc.includes('camera')) return 'Camera';
    if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner') || lowerDesc.includes('breakfast') || lowerDesc.includes('food') || lowerDesc.includes('restaurant')) return 'Utensils';
    if (lowerDesc.includes('shop') || lowerDesc.includes('boutique') || lowerDesc.includes('store')) return 'ShoppingBag';
    if (lowerDesc.includes('gym') || lowerDesc.includes('workout') || lowerDesc.includes('exercise') || lowerDesc.includes('yoga')) return 'Dumbbell';
    if (lowerDesc.includes('evening') || lowerDesc.includes('night') || lowerDesc.includes('sleep')) return 'Moon';
    if (lowerDesc.includes('morning') || lowerDesc.includes('woke') || lowerDesc.includes('sunrise')) return 'Sun';
    if (lowerDesc.includes('home') || lowerDesc.includes('apartment')) return 'Home';
    if (lowerDesc.includes('relax') || lowerDesc.includes('chill') || lowerDesc.includes('positive')) return 'Heart';
    if (lowerDesc.includes('music') || lowerDesc.includes('concert')) return 'Music';
    if (lowerDesc.includes('read') || lowerDesc.includes('book') || lowerDesc.includes('study')) return 'BookOpen';
    return 'Activity';
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

// Timezone mapping for cities
const TIMEZONE_MAP: Record<string, string> = {
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles',
    'London': 'Europe/London',
    'Berlin': 'Europe/Berlin',
    'Paris': 'Europe/Paris',
    'Dubai': 'Asia/Dubai',
    'Tokyo': 'Asia/Tokyo',
    'Mumbai': 'Asia/Kolkata',
    'Sydney': 'Australia/Sydney',
    'São Paulo': 'America/Sao_Paulo',
    'Lagos': 'Africa/Lagos',
    'Stockholm': 'Europe/Stockholm',
    'Warsaw': 'Europe/Warsaw',
    'Krakow': 'Europe/Warsaw',
    'Kraków': 'Europe/Warsaw',
    'Cracow': 'Europe/Warsaw',
};

// Get local time for a city
function getLocalTimeForCity(city: string): string {
    const timeZone = TIMEZONE_MAP[city] || 'UTC';
    try {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone
        });
    } catch {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
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
    const timelineItems: TimelineItem[] = [
        // Add memories
        ...influencer.memories.map(memory => ({
            id: memory.id,
            time: memory.createdAt,
            icon: getActivityIconName(memory.description),
            action: memory.description.split(' - ')[0] || memory.description.slice(0, 30),
            description: memory.description,
            type: 'life' as const,
            importance: memory.importance,
        })),
        // Add posts as content items
        ...influencer.posts.map(post => ({
            id: post.id,
            time: post.postedAt,
            icon: 'Camera',
            action: post.type === 'VIDEO' ? 'Video generated' : 'Photo generated',
            description: post.caption,
            type: 'content' as const,
            contentUrl: post.contentUrl,
        })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Check if there are any real activities
    const hasRealActivity = timelineItems.length > 0;

    // For visual status badge
    const isRecentlyActive = hasRealActivity &&
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
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold">Livra</span>
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
                                <ImageLightbox
                                    src={influencer.faceReferences[0]}
                                    alt={influencer.name}
                                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                                    {influencer.name.charAt(0)}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h1 className="text-2xl font-bold">{influencer.name}</h1>

                                    {/* Realtime Activity Status */}
                                    <RealtimeActivityStatus
                                        influencerId={influencer.id}
                                        initialLifecycleStatus={influencer.lifecycleStatus}
                                        initialLifecycleStartedAt={influencer.lifecycleStartedAt}
                                        initialCurrentActivity={influencer.currentActivity}
                                        initialActivityDetails={influencer.activityDetails}
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {influencer.city}, {influencer.country}
                                    </span>
                                    <span className="flex items-center gap-1 text-teal-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {getLocalTimeForCity(influencer.city)} local
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
                                {/* Avatar controls - only before lifecycle starts */}
                                {influencer.faceReferences.length > 0 && !hasRealActivity && (
                                    <>
                                        {/* Swap from library */}
                                        <AvatarSwap
                                            influencerId={influencer.id}
                                            currentAvatarUrl={influencer.faceReferences[0]}
                                        />
                                        {/* Generate new */}
                                        <Link
                                            href={`/influencer/${influencer.id}/avatar`}
                                            className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-all"
                                            title="Generate New Avatar"
                                        >
                                            <Wand2 className="w-5 h-5" />
                                        </Link>
                                    </>
                                )}
                                <LifecycleControls
                                    influencerId={influencer.id}
                                    initialIsActive={(influencer as any).isActive || false}
                                    hasAvatar={influencer.faceReferences.length > 0}
                                />
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
                            className="block glass-card rounded-2xl p-6 mb-8 border border-teal-500/30 hover:border-teal-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg group-hover:text-teal-400 transition-colors">
                                        Create Your Avatar
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        Define {influencer.name}&apos;s appearance and generate AI avatar options
                                    </p>
                                </div>
                                <div className="text-teal-400">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Daily Outfit */}
                    {influencer.dailyOutfit && (() => {
                        const outfit = influencer.dailyOutfit as any;
                        return (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Shirt className="w-5 h-5 text-purple-400" />
                                    Today's Outfit
                                </h2>
                                <div className="glass-card p-5 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Top</span>
                                            <span className="text-zinc-200">{outfit.top}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Bottom</span>
                                            <span className="text-zinc-200">{outfit.bottom}</span>
                                        </div>
                                        {outfit.tightsColor && (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Tights</span>
                                                <span className="text-zinc-200 capitalize">{outfit.tightsColor} sheer</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Footwear</span>
                                            <span className="text-zinc-200">{outfit.footwear}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Accessories</span>
                                            <span className="text-zinc-200">{outfit.accessories || 'None'}</span>
                                        </div>
                                        {outfit.outerwear && (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Outerwear</span>
                                                <span className="text-zinc-200">{outfit.outerwear}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Timeline */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {hasRealActivity ? 'Activity Timeline' : 'Waiting for First Activity'}
                        </h2>
                    </div>

                    {/* Real-time Timeline Component */}
                    <RealtimeTimeline
                        influencerId={influencer.id}
                        initialItems={timelineItems}
                    />

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
