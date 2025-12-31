"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, X } from "lucide-react";
import Link from "next/link";

interface Avatar {
    id: string;
    url: string;
    hairColor?: string;
    skinTone?: string;
    eyeColor?: string;
    bodyType?: string;
    createdAt: string;
}

export default function AvatarLibraryPage() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

    useEffect(() => {
        fetchAvatars();
    }, []);

    const fetchAvatars = async () => {
        try {
            const response = await fetch("/api/avatars");
            const data = await response.json();
            if (data.success) {
                setAvatars(data.avatars);
            }
        } catch (error) {
            console.error("Failed to fetch avatars:", error);
        } finally {
            setIsLoading(false);
        }
    };

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
                            {isLoading ? "Loading..." : `${avatars.length} avatar${avatars.length !== 1 ? "s" : ""} generated`}
                        </p>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-zinc-400">Loading library...</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && avatars.length === 0 && (
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
                    )}

                    {/* Avatar grid */}
                    {!isLoading && avatars.length > 0 && (
                        <>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {avatars.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className="group relative cursor-zoom-in"
                                    >
                                        <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-all">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatar.url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                                    </button>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <p className="text-sm text-zinc-400">
                                    💡 Click on any avatar to view full size. These avatars are automatically available when creating new influencers.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Lightbox Modal */}
            {selectedAvatar && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedAvatar(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        onClick={() => setSelectedAvatar(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="max-w-3xl max-h-[90vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedAvatar.url}
                            alt="Avatar full size"
                            className="max-w-full max-h-[80vh] rounded-2xl object-contain"
                        />

                        {/* Avatar details */}
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {selectedAvatar.hairColor && (
                                <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
                                    Hair: {selectedAvatar.hairColor}
                                </span>
                            )}
                            {selectedAvatar.eyeColor && (
                                <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
                                    Eyes: {selectedAvatar.eyeColor}
                                </span>
                            )}
                            {selectedAvatar.skinTone && (
                                <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
                                    Skin: {selectedAvatar.skinTone}
                                </span>
                            )}
                            {selectedAvatar.bodyType && (
                                <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
                                    Body: {selectedAvatar.bodyType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
