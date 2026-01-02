"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
    Coffee, Camera, Utensils, ShoppingBag, Dumbbell, Moon, Sun,
    Activity, Heart, Home, Music, BookOpen, type LucideIcon
} from "lucide-react";
import ImageLightbox from "@/app/components/ImageLightbox";

// Timeline item type
export interface TimelineItem {
    id: string;
    time: Date;
    icon: LucideIcon;
    action: string;
    description: string;
    type: 'life' | 'content';
    contentUrl?: string;
    importance?: number;
}

// Database types matching Prisma
interface MemoryRecord {
    id: string;
    influencerId: string;
    description: string;
    importance: number;
    createdAt: string;
}

interface PostRecord {
    id: string;
    influencerId: string;
    type: string;
    contentUrl: string;
    caption: string;
    postedAt: string;
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

interface RealtimeTimelineProps {
    influencerId: string;
    initialItems: TimelineItem[];
}

export default function RealtimeTimeline({ influencerId, initialItems }: RealtimeTimelineProps) {
    const [items, setItems] = useState<TimelineItem[]>(initialItems);
    const [isConnected, setIsConnected] = useState(false);

    // Convert memory record to timeline item
    const memoryToTimelineItem = useCallback((memory: MemoryRecord): TimelineItem => ({
        id: memory.id,
        time: new Date(memory.createdAt),
        icon: getActivityIcon(memory.description),
        action: memory.description.split(' - ')[0] || memory.description.slice(0, 30),
        description: memory.description,
        type: 'life',
        importance: memory.importance,
    }), []);

    // Convert post record to timeline item
    const postToTimelineItem = useCallback((post: PostRecord): TimelineItem => ({
        id: post.id,
        time: new Date(post.postedAt),
        icon: Camera,
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

    // Subscribe to real-time updates
    useEffect(() => {
        console.log('[RealtimeTimeline] Setting up subscriptions for influencer:', influencerId);

        // Channel for Memory table
        const memoryChannel = supabase
            .channel(`memory-${influencerId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Memory',
                    filter: `influencerId=eq.${influencerId}`,
                },
                (payload) => {
                    console.log('[RealtimeTimeline] New memory received:', payload);
                    const newMemory = payload.new as MemoryRecord;
                    addItem(memoryToTimelineItem(newMemory));
                }
            )
            .subscribe((status) => {
                console.log('[RealtimeTimeline] Memory channel status:', status);
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                }
            });

        // Channel for Post table
        const postChannel = supabase
            .channel(`post-${influencerId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Post',
                    filter: `influencerId=eq.${influencerId}`,
                },
                (payload) => {
                    console.log('[RealtimeTimeline] New post received:', payload);
                    const newPost = payload.new as PostRecord;
                    addItem(postToTimelineItem(newPost));
                }
            )
            .subscribe((status) => {
                console.log('[RealtimeTimeline] Post channel status:', status);
            });

        // Cleanup on unmount
        return () => {
            console.log('[RealtimeTimeline] Cleaning up subscriptions');
            supabase.removeChannel(memoryChannel);
            supabase.removeChannel(postChannel);
        };
    }, [influencerId, addItem, memoryToTimelineItem, postToTimelineItem]);

    // Update relative times every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setItems(prev => [...prev]); // Force re-render to update relative times
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const hasRealActivity = items.length > 0;

    return (
        <div className="relative">
            {/* Connection indicator */}
            <div className="absolute -top-8 right-0 flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-zinc-500">
                    {isConnected ? 'Live updates enabled' : 'Connecting...'}
                </span>
            </div>

            {hasRealActivity ? (
                <>
                    {/* Timeline line */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                    {/* Timeline items */}
                    <div className="space-y-6">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isContent = item.type === "content";
                            const isNew = (new Date().getTime() - new Date(item.time).getTime()) < 10000; // Highlight items < 10s old

                            return (
                                <div
                                    key={item.id}
                                    className={`relative flex gap-4 transition-all duration-500 ${isNew ? 'animate-pulse' : ''}`}
                                >
                                    {/* Icon */}
                                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isContent
                                            ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                            : item.importance && item.importance >= 4
                                                ? "bg-gradient-to-br from-orange-500 to-red-500"
                                                : "bg-zinc-800"
                                        } ${isNew ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-zinc-900' : ''}`}>
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
                                            {isNew && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/20 text-purple-400">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-400">{item.description}</p>

                                        {isContent && item.contentUrl && (
                                            <div className="mt-3 aspect-video rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                {item.contentUrl ? (
                                                    <ImageLightbox
                                                        src={item.contentUrl}
                                                        alt="Generated content"
                                                        className="w-full h-full object-cover"
                                                    />
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
        </div>
    );
}
