"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
    Coffee, Camera, Utensils, ShoppingBag, Dumbbell, Moon, Sun,
    Activity, Heart, Home, Music, BookOpen, LayoutGrid, List, type LucideIcon
} from "lucide-react";
import ImageLightbox from "@/app/components/ImageLightbox";
import ImageGallery from "@/app/components/ImageGallery";

// Timeline item type
export interface TimelineItem {
    id: string;
    time: Date | string; // Can be Date or ISO string after serialization
    icon: string; // Changed from LucideIcon to string for serialization
    action: string;
    description: string;
    type: 'life' | 'content';
    contentUrl?: string;
    importance?: number;
}

// Database types matching Prisma
interface MemoryRecord {
    id: string;
    personaId: string;
    description: string;
    importance: number;
    createdAt: string;
}

interface PostRecord {
    id: string;
    personaId: string;
    type: string;
    contentUrl: string;
    caption: string;
    postedAt: string;
}

// Parse timestamp ensuring UTC interpretation
// Supabase real-time returns timestamps without 'Z', so JS interprets as local time
function parseTimestamp(timestamp: string | Date): Date {
    if (timestamp instanceof Date) return timestamp;
    // If timestamp doesn't end with Z, add it to force UTC interpretation
    const normalized = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
    return new Date(normalized);
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

const IconMap: Record<string, LucideIcon> = {
    Coffee, Camera, Utensils, ShoppingBag, Dumbbell, Moon, Sun,
    Activity, Heart, Home, Music, BookOpen
};

// Format relative time - handles both Date objects and ISO strings
function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

interface RealtimeTimelineProps {
    personaId: string;
    initialItems: TimelineItem[];
}

export default function RealtimeTimeline({ personaId, initialItems }: RealtimeTimelineProps) {
    const [items, setItems] = useState<TimelineItem[]>(initialItems);
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [postsOffset, setPostsOffset] = useState(20); // Initial load is 20
    const [memoriesOffset, setMemoriesOffset] = useState(20);

    // Convert memory record to timeline item
    const memoryToTimelineItem = useCallback((memory: MemoryRecord): TimelineItem => ({
        id: memory.id,
        time: parseTimestamp(memory.createdAt),
        icon: getActivityIconName(memory.description),
        action: memory.description.split(' - ')[0] || memory.description.slice(0, 30),
        description: memory.description,
        type: 'life',
        importance: memory.importance,
    }), []);

    // Convert post record to timeline item
    const postToTimelineItem = useCallback((post: PostRecord): TimelineItem => ({
        id: post.id,
        time: parseTimestamp(post.postedAt),
        icon: 'Camera',
        action: post.type === 'VIDEO' ? 'Video generated' : 'Photo generated',
        description: post.caption,
        type: 'content',
        contentUrl: post.contentUrl,
    }), []);

    // Add item to timeline
    const addItem = useCallback((newItem: TimelineItem) => {
        setItems(prev => {
            // Check for duplicates
            if (prev.some(item => item.id === newItem.id)) {
                return prev;
            }
            // Add and sort by time (newest first)
            return [...prev, newItem].sort((a, b) =>
                new Date(b.time).getTime() - new Date(a.time).getTime()
            );
        });
    }, []);

    // Load more items
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const response = await fetch(
                `/api/persona/${personaId}/timeline?postsOffset=${postsOffset}&memoriesOffset=${memoriesOffset}`
            );
            const data = await response.json();

            if (data.posts || data.memories) {
                const newItems: TimelineItem[] = [
                    ...(data.memories || []).map(memoryToTimelineItem),
                    ...(data.posts || []).map(postToTimelineItem),
                ];

                setItems(prev => {
                    // Merge and deduplicate
                    const merged = [...prev, ...newItems];
                    const unique = merged.filter((item, index, self) =>
                        index === self.findIndex(t => t.id === item.id)
                    );
                    // Sort by time (newest first)
                    return unique.sort((a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                    );
                });

                // Update offsets
                setPostsOffset(prev => prev + 20);
                setMemoriesOffset(prev => prev + 20);

                // Check if there's more data
                setHasMore(data.hasMorePosts || data.hasMoreMemories);
            }
        } catch (error) {
            console.error('Error loading more timeline items:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [personaId, postsOffset, memoriesOffset, isLoadingMore, hasMore, memoryToTimelineItem, postToTimelineItem]);

    // Load latest items (to catch up after disconnect)
    const refreshTimeline = useCallback(async () => {
        try {
            const response = await fetch(`/api/persona/${personaId}/timeline?limit=10`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.posts || data.memories) {
                const latestItems: TimelineItem[] = [
                    ...(data.memories || []).map(memoryToTimelineItem),
                    ...(data.posts || []).map(postToTimelineItem),
                ];

                setItems(prev => {
                    const merged = [...latestItems, ...prev];
                    const unique = merged.filter((item, index, self) =>
                        index === self.findIndex(t => t.id === item.id)
                    );
                    return unique.sort((a, b) =>
                        new Date(b.time).getTime() - new Date(a.time).getTime()
                    );
                });
            }
        } catch (error) {
            console.error('[RealtimeTimeline] Refresh failed:', error);
        }
    }, [personaId, memoryToTimelineItem, postToTimelineItem]);

    // Subscribe to real-time updates
    useEffect(() => {

        const channel = supabase
            .channel(`persona-timeline-${personaId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Memory',
                    filter: `personaId=eq.${personaId}`,
                },
                (payload) => {
                    addItem(memoryToTimelineItem(payload.new as MemoryRecord));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Post',
                    filter: `personaId=eq.${personaId}`,
                },
                (payload) => {
                    addItem(postToTimelineItem(payload.new as PostRecord));
                }
            )
            .subscribe(async (status, err) => {
                if (err) console.error('[RealtimeTimeline] Subscription error:', err);

                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    // Always refresh when (re)subscribed to catch any missed events
                    await refreshTimeline();
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsConnected(false);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [personaId, addItem, memoryToTimelineItem, postToTimelineItem, refreshTimeline]);

    // Update relative times every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setItems(prev => [...prev]); // Force re-render to update relative times
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const hasRealActivity = items.length > 0;
    const photoItems = items.filter(item => item.type === 'content' && item.contentUrl);

    return (
        <div className="relative">
            {/* Header with View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                    {hasRealActivity ? 'Activity' : 'Waiting for First Activity'}
                </h2>

                <div className="flex border border-white/10 rounded-lg p-1 bg-zinc-900/50">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'timeline'
                            ? 'bg-zinc-800 text-teal-400 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
                            ? 'bg-zinc-800 text-teal-400 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Photos
                    </button>
                </div>
            </div>

            {/* Connection indicator */}
            <div className="absolute -top-12 right-0 flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-zinc-500">
                    {isConnected ? 'Live updates' : 'Connecting...'}
                </span>
            </div>

            {hasRealActivity ? (
                <>
                    {viewMode === 'timeline' ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                            {/* Timeline items */}
                            <div className="space-y-6">
                                {items.map((item) => {
                                    const Icon = IconMap[item.icon] || Activity;
                                    const isContent = item.type === "content";
                                    const isNew = (new Date().getTime() - new Date(item.time).getTime()) < 10000;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`relative flex gap-4 transition-all duration-500 ${isNew ? 'animate-pulse' : ''}`}
                                        >
                                            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isContent
                                                ? "bg-gradient-to-br from-teal-500 to-emerald-500"
                                                : item.importance && item.importance >= 4
                                                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                                                    : "bg-zinc-800"
                                                } ${isNew ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-zinc-900' : ''}`}>
                                                <Icon className={`w-5 h-5 ${isContent || (item.importance && item.importance >= 4) ? "text-white" : "text-zinc-400"}`} />
                                            </div>

                                            <div className={`flex-1 ${isContent ? "glass-card rounded-xl p-4" : "pt-2"}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-zinc-500 font-mono">
                                                        {formatRelativeTime(item.time)}
                                                    </span>
                                                    <span className={`font-medium ${isContent ? "gradient-text" : ""}`}>
                                                        {item.action}
                                                    </span>
                                                    {isNew && (
                                                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-teal-500/20 text-teal-400">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-400">{item.description}</p>

                                                {isContent && item.contentUrl && (
                                                    <div className="mt-3 aspect-video rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden cursor-zoom-in group/img">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={item.contentUrl}
                                                            alt="Generated content"
                                                            className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                                                            onClick={() => {
                                                                const idx = photoItems.findIndex(p => p.id === item.id);
                                                                if (idx !== -1) setGalleryIndex(idx);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Grid View */
                        photoItems.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {photoItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-zoom-in"
                                        onClick={() => setGalleryIndex(index)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.contentUrl!}
                                            alt={item.description}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                            <p className="text-xs text-white/90 line-clamp-2">{item.description}</p>
                                            <span className="text-[10px] text-zinc-400 mt-1">{formatRelativeTime(item.time)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <Camera className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
                                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                                    When this persona generates any photos, they will appear here in a beautiful grid.
                                </p>
                            </div>
                        )
                    )}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                    <p className="text-zinc-400 text-sm max-w-md mx-auto">
                        The autonomous life cycle is starting up.
                        Activities will appear here as they happen throughout the day.
                    </p>
                </div>
            )}

            {/* Gallery Overlay */}
            {galleryIndex !== null && (
                <ImageGallery
                    images={photoItems.map(item => ({
                        url: item.contentUrl!,
                        description: item.description
                    }))}
                    initialIndex={galleryIndex}
                    onClose={() => setGalleryIndex(null)}
                />
            )}
        </div>
    );
}
