import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sparkles, MapPin, Wallet, Heart, MessageCircle, Share2 } from "lucide-react";

interface FeedPageProps {
    params: Promise<{ id: string }>;
}

export default async function FeedPage({ params }: FeedPageProps) {
    const { id } = await params;

    const influencer = await prisma.influencer.findUnique({
        where: { id },
        include: {
            posts: {
                orderBy: { postedAt: "desc" },
                take: 10,
            },
        },
    });

    if (!influencer) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold">Livra</span>
                    </a>
                </div>
            </header>

            {/* Profile section */}
            <div className="pt-20 pb-6 px-4 max-w-lg mx-auto">
                <div className="flex items-center gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl">
                        {influencer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{influencer.name}</h1>
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{influencer.city}, {influencer.country}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-zinc-400 mt-1">
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="gradient-text font-medium">${influencer.currentBalance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-6 text-sm">
                    <div className="text-center">
                        <span className="font-bold text-lg">{influencer.posts.length}</span>
                        <span className="text-zinc-400 block">posts</span>
                    </div>
                    <div className="text-center">
                        <span className="font-bold text-lg">0</span>
                        <span className="text-zinc-400 block">followers</span>
                    </div>
                </div>

                <p className="mt-4 text-sm text-zinc-400">
                    {influencer.personalityVibe.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} • {influencer.apartmentStyle.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
            </div>

            {/* Posts feed */}
            <div className="border-t border-zinc-800">
                {influencer.posts.length === 0 ? (
                    <div className="px-4 py-16 text-center max-w-lg mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">No posts yet</h2>
                        <p className="text-zinc-400 text-sm">
                            {influencer.name} is getting ready. First content coming soon!
                        </p>
                        <p className="text-zinc-500 text-xs mt-4">
                            The AI is generating the first day of content...
                        </p>
                    </div>
                ) : (
                    <div className="max-w-lg mx-auto">
                        {influencer.posts.map((post) => (
                            <div key={post.id} className="border-b border-zinc-800">
                                {/* Post header */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xs">
                                        {influencer.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-sm">{influencer.name}</span>
                                </div>

                                {/* Post image */}
                                <div className="aspect-square bg-zinc-900">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={post.contentUrl} alt="" className="w-full h-full object-cover" />
                                </div>

                                {/* Post actions */}
                                <div className="p-4">
                                    <div className="flex gap-4 mb-3">
                                        <button className="text-zinc-400 hover:text-white transition-colors">
                                            <Heart className="w-6 h-6" />
                                        </button>
                                        <button className="text-zinc-400 hover:text-white transition-colors">
                                            <MessageCircle className="w-6 h-6" />
                                        </button>
                                        <button className="text-zinc-400 hover:text-white transition-colors">
                                            <Share2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <p className="text-sm">
                                        <span className="font-medium">{influencer.name}</span>{" "}
                                        {post.caption}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        {new Date(post.postedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
