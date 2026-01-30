'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PersonaInfo {
    id: string;
    name: string;
    faceReferences: string[];
}

interface TimelineItem {
    id: string;
    type: 'memory' | 'post';
    content: string;
    caption?: string; // Only for posts
    timestamp: string;
    persona: PersonaInfo;
    importance: number;
}

export default function GlobalTimeline() {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const supabase = createClient();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await fetch('/api/pulse');
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (err) {
                console.error('Failed to fetch initial pulse:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitial();
    }, []);

    // Realtime subscription
    useEffect(() => {
        // Subscribe to ALL public changes
        // Note: In a real prod app with RLS, we'd only receive what we are allowed to see.
        // Since we disabled RLS for MVP and handle logic in API, here we just listen to everything
        // and fetch details (including persona info) when an ID arrives, OR rely on a simpler approach.
        // Because payload.new doesn't include the related 'persona' object, we need to fetch the persona info 
        // or just re-fetch the latest pulse when something happens.
        // fetching single item details is better for performance.

        // For MVP: When ANY insert happens, we re-fetch the top of the feed (or just add it if we had the persona data available, but we don't).
        // Let's do a smart thing: Listen for INSERT, then fetch that specific record enriched with Persona data.

        // Actually, for simplicity and robustness in this pass:
        // We will just listen to inserts and refresh the list (poll-style trigger) or implement a specialized API to get "one item enriched".

        // Let's subscribe
        const channel = supabase
            .channel('global-pulse')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Memory' },
                async (payload) => {
                    // Fetch enriched item
                    const res = await fetch(`/api/pulse/item?id=${payload.new.id}&type=memory`);
                    if (res.ok) {
                        const newItem = await res.json();
                        addItem(newItem);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Post' },
                async (payload) => {
                    const res = await fetch(`/api/pulse/item?id=${payload.new.id}&type=post`);
                    if (res.ok) {
                        const newItem = await res.json();
                        addItem(newItem);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
                else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setIsConnected(false);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const addItem = (newItem: TimelineItem) => {
        setItems((prev) => {
            // Deduplicate
            if (prev.find(i => i.id === newItem.id)) return prev;
            // Add to top
            return [newItem, ...prev].slice(0, 100);
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto px-4 py-8">
            {/* Status Indicator */}
            <div className="flex justify-end items-center gap-2 text-xs text-zinc-500 mb-4 sticky top-4 z-10 px-4">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'LIVE PULSE' : 'CONNECTING...'}
            </div>

            <div className="space-y-8 relative">
                {/* Visual Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative pl-20 group"
                        >
                            {/* Timestamp / Dot */}
                            <div className="absolute left-[29px] top-6 w-1.5 h-1.5 rounded-full bg-zinc-700 ring-4 ring-background group-hover:bg-teal-500 transition-colors" />
                            <div className="absolute left-2 top-5 text-xs text-zinc-500 w-16 text-right font-mono opacity-50">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {/* Content Card */}
                            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                                {/* Header: Persona Info */}
                                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/2">
                                    <Link href={`/persona/${item.persona.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                                            {item.persona.faceReferences?.[0] ? (
                                                <img src={item.persona.faceReferences[0]} alt={item.persona.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">?</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm text-zinc-200">{item.persona.name}</span>
                                    </Link>
                                    <Link href={`/persona/${item.persona.id}`} className="text-zinc-600 hover:text-zinc-400">
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                {/* Body */}
                                {item.type === 'memory' ? (
                                    <div className="p-5">
                                        <p className="text-zinc-300 leading-relaxed text-sm">
                                            {item.content}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-black/40">
                                        <div className="aspect-[4/5] relative">
                                            <img
                                                src={item.content}
                                                alt="Post content"
                                                className="absolute inset-0 w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
                                                <p className="text-white text-sm line-clamp-2">
                                                    {item.caption}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div ref={bottomRef} />
            </div>

            {items.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    <p>No activity in the world yet.</p>
                </div>
            )}
        </div>
    );
}
