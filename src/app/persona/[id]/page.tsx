import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Sparkles, ArrowLeft, MapPin, Wallet, Download, Wand2,
    Zap, Clock, Play, Pause, Moon, Brain, Camera, Coffee, Settings
} from "lucide-react";
import ImageLightbox from "@/app/components/ImageLightbox";
import AvatarSwap from "@/app/components/AvatarSwap";
import RealtimeTimeline, { TimelineItem } from "@/app/components/RealtimeTimeline";
import LifecycleControls from "@/app/components/LifecycleControls";
import RealtimeActivityStatus from "@/app/components/RealtimeActivityStatus";
import RealtimeOutfit from "@/app/components/RealtimeOutfit";
import ManualActivityTrigger from "@/app/components/ManualActivityTrigger";

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
    } catch (e: any) {
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

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

// ... (imports remain)

export default async function AvatarProfilePage({ params }: TimelinePageProps) {
    const { id } = await params;

    // 1. Verify Authentication
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const persona = await prisma.persona.findUnique({
        where: { id },
        include: {
            posts: {
                orderBy: { postedAt: "desc" },
                take: 20,
            },
            memories: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    if (!persona) {
        notFound();
    }

    // 2. Verify Access
    const isOwner = persona.userId === user.id;
    if (!isOwner && !(persona as any).isPublic) {
        redirect("/dashboard");
    }

    if (!persona) {
        notFound();
    }

    // Combine memories and posts into a unified timeline
    const timelineItems: TimelineItem[] = [
        // Add memories
        ...persona.memories.map((memory: any) => ({
            id: memory.id,
            time: memory.createdAt,
            icon: getActivityIconName(memory.description),
            action: memory.description.split(' - ')[0] || memory.description.slice(0, 30),
            description: memory.description,
            type: 'life' as const,
            importance: memory.importance,
        })),
        // Add posts as content items
        ...persona.posts.map((post: any) => ({
            id: post.id,
            time: post.postedAt,
            icon: 'Camera',
            action: post.type === 'VIDEO' ? 'Video generated' : 'Photo generated',
            description: post.caption,
            type: 'content' as const,
            contentUrl: post.contentUrl,
        })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Check if lifecycle has actually started (not just if there are timeline items)
    // This allows avatar editing even if there are initial memories before lifecycle starts
    const hasRealActivity = persona.lifecycleStartedAt !== null;

    // For visual status badge
    const isRecentlyActive = hasRealActivity &&
        (new Date().getTime() - new Date(timelineItems[0]?.time || 0).getTime()) < 8 * 60 * 60 * 1000;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    {isOwner ? (
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Dashboard</span>
                        </Link>
                    ) : (
                        <Link href="/pulse" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Pulse</span>
                        </Link>
                    )}

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
                            {persona.faceReferences.length > 0 ? (
                                <ImageLightbox
                                    src={persona.faceReferences[0]}
                                    alt={persona.name}
                                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                                    {persona.name.charAt(0)}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h1 className="text-2xl font-bold">{persona.name}</h1>

                                    {/* Realtime Activity Status */}
                                    <RealtimeActivityStatus
                                        personaId={persona.id}
                                        initialLifecycleStatus={persona.lifecycleStatus}
                                        initialLifecycleStartedAt={persona.lifecycleStartedAt}
                                        initialCurrentActivity={persona.currentActivity}
                                        initialActivityDetails={persona.activityDetails}
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {persona.city}, {persona.country}
                                    </span>
                                    <span className="flex items-center gap-1 text-teal-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {getLocalTimeForCity(persona.city)} local
                                    </span>
                                    {isOwner && (
                                        <span className="flex items-center gap-1">
                                            <Wallet className="w-3.5 h-3.5" />
                                            <span className="gradient-text font-medium">${persona.currentBalance.toLocaleString()}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-500 mt-2">
                                    {persona.personalityVibe.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} • {persona.apartmentStyle.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </p>
                            </div>

                            {/* Controls - Owner Only */}
                            {isOwner && (
                                <div className="flex gap-2">
                                    {/* Avatar controls - only before lifecycle starts */}
                                    {persona.faceReferences.length > 0 && !hasRealActivity && (
                                        <>
                                            {/* Swap from library */}
                                            <AvatarSwap
                                                personaId={persona.id}
                                                currentAvatarUrl={persona.faceReferences[0]}
                                            />
                                            {/* Generate new */}
                                            <Link
                                                href={`/persona/${persona.id}/avatar`}
                                                className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-all"
                                                title="Generate New Avatar Look"
                                            >
                                                <Wand2 className="w-5 h-5" />
                                            </Link>
                                        </>
                                    )}
                                    <ManualActivityTrigger
                                        personaId={persona.id}
                                        isActive={(persona as any).isActive || false}
                                    />
                                    <LifecycleControls
                                        personaId={persona.id}
                                        initialIsActive={(persona as any).isActive || false}
                                        hasAvatar={persona.faceReferences.length > 0}
                                    />
                                    <Link
                                        href={`/persona/${persona.id}/settings`}
                                        className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-all"
                                        title="Edit Preferences"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Link>
                                    <button className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Create Avatar Banner - show if no avatar yet */}
                    {persona.faceReferences.length === 0 && (
                        <Link
                            href={`/persona/${persona.id}/avatar`}
                            className="block glass-card rounded-2xl p-6 mb-8 border border-teal-500/30 hover:border-teal-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg group-hover:text-teal-400 transition-colors">
                                        Create Your Avatar Look
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        Define {persona.name}&apos;s appearance and generate AI avatar options
                                    </p>
                                </div>
                                <div className="text-teal-400">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    )}


                    {/* Daily Outfit - Realtime Updates */}
                    <RealtimeOutfit
                        personaId={persona.id}
                        initialDailyOutfit={persona.dailyOutfit as any}
                    />

                    {/* Timeline */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {hasRealActivity ? 'Activity Timeline' : 'Waiting for First Activity'}
                        </h2>
                    </div>

                    {/* Real-time Timeline Component */}
                    <RealtimeTimeline
                        personaId={persona.id}
                        initialItems={timelineItems}
                    />

                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{persona.posts.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Posts Generated</span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{timelineItems.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Total Activities</span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{persona.memories.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Memories</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
