"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shirt } from "lucide-react";

interface DailyOutfit {
    top: string;
    bottom: string;
    footwear: string;
    accessories: string;
    tightsColor?: string;
    outerwear?: string;
}

interface RealtimeOutfitProps {
    personaId: string;
    initialDailyOutfit: DailyOutfit | null;
}

export default function RealtimeOutfit({
    personaId,
    initialDailyOutfit,
}: RealtimeOutfitProps) {
    const [outfit, setOutfit] = useState<DailyOutfit | null>(initialDailyOutfit);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        // Animation trigger on mount/change
        if (outfit) setHasLoaded(true);
    }, [outfit]);

    useEffect(() => {
        // Subscribe to real-time updates on Persona table
        const channel = supabase
            .channel(`persona-outfit-${personaId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Persona',
                    filter: `id=eq.${personaId}`,
                },
                (payload) => {
                    const updated = payload.new as { dailyOutfit?: DailyOutfit };
                    if (updated.dailyOutfit) {
                        setOutfit(updated.dailyOutfit);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [personaId]);

    if (!outfit) return null;

    return (
        <div className="mb-8">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group mb-4"
            >
                <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        Today's Outfit
                    </h2>
                </div>
                <span className={`text-zinc-500 text-xs uppercase tracking-wider transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="glass-card p-5 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Top</span>
                            <span className="text-zinc-200 capitalize">{outfit.top}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Bottom</span>
                            <span className="text-zinc-200 capitalize">{outfit.bottom}</span>
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
                            <span className="text-zinc-200 capitalize">{outfit.footwear}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Accessories</span>
                            <span className="text-zinc-200 capitalize">{outfit.accessories || 'None'}</span>
                        </div>
                        {outfit.outerwear && (
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Outerwear</span>
                                <span className="text-zinc-200 capitalize">{outfit.outerwear}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
