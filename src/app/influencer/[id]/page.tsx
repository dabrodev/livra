import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Sparkles, ArrowLeft, MapPin, Wallet, Play, Pause, Download,
    Coffee, Camera, Utensils, ShoppingBag, Dumbbell, Moon, Sun,
    Activity, Zap
} from "lucide-react";

interface TimelinePageProps {
    params: Promise<{ id: string }>;
}

// Mock activities for demo - later this comes from Memory model + Inngest workflow
const mockActivities = [
    { time: "08:00", icon: Sun, action: "Woke up", description: "Started the day in their minimalist apartment", type: "life" },
    { time: "08:30", icon: Coffee, action: "Morning coffee", description: "Visited a local cafe in the neighborhood", type: "life" },
    { time: "09:15", icon: Camera, action: "Photo generated", description: "Captured morning vibes at the cafe", type: "content", contentUrl: "/placeholder.jpg" },
    { time: "11:00", icon: Dumbbell, action: "Workout session", description: "Hit the gym for a quick workout", type: "life" },
    { time: "13:00", icon: Utensils, action: "Lunch break", description: "Healthy lunch at a trendy restaurant", type: "life" },
    { time: "14:30", icon: Camera, action: "Photo generated", description: "Food photography for the feed", type: "content", contentUrl: "/placeholder.jpg" },
    { time: "16:00", icon: ShoppingBag, action: "Shopping", description: "Exploring local boutiques", type: "life" },
    { time: "19:00", icon: Moon, action: "Evening in", description: "Relaxing at home, preparing content", type: "life" },
];

export default async function InfluencerTimelinePage({ params }: TimelinePageProps) {
    const { id } = await params;

    const influencer = await prisma.influencer.findUnique({
        where: { id },
        include: {
            posts: {
                orderBy: { postedAt: "desc" },
                take: 5,
            },
            memories: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!influencer) {
        notFound();
    }

    // For demo, use current status
    const isActive = true;

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
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                                {influencer.name.charAt(0)}
                            </div>

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
                                    {influencer.personalityVibe.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} • {influencer.apartmentStyle.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
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

                    {/* Timeline */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4">Today&apos;s Timeline</h2>
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                        {/* Timeline items */}
                        <div className="space-y-6">
                            {mockActivities.map((activity, index) => {
                                const Icon = activity.icon;
                                const isContent = activity.type === "content";

                                return (
                                    <div key={index} className="relative flex gap-4">
                                        {/* Icon */}
                                        <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isContent
                                                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                                : "bg-zinc-800"
                                            }`}>
                                            <Icon className={`w-5 h-5 ${isContent ? "text-white" : "text-zinc-400"}`} />
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 ${isContent ? "glass-card rounded-xl p-4" : "pt-2"}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-zinc-500 font-mono">{activity.time}</span>
                                                <span className={`font-medium ${isContent ? "gradient-text" : ""}`}>
                                                    {activity.action}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-400">{activity.description}</p>

                                            {isContent && (
                                                <div className="mt-3 aspect-video rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <span className="text-zinc-600 text-sm">Generated content preview</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{influencer.posts.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Posts Generated</span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                            <span className="text-2xl font-bold gradient-text">{mockActivities.length}</span>
                            <span className="text-sm text-zinc-400 block mt-1">Activities Today</span>
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
