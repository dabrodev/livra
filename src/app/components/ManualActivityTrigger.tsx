"use client";

import { useState } from "react";
import { Zap, Home, MapPin, Loader2, ChevronDown, Check } from "lucide-react";

interface ManualActivityTriggerProps {
    personaId: string;
    isActive: boolean;
}

export default function ManualActivityTrigger({ personaId, isActive }: ManualActivityTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isTriggering, setIsTriggering] = useState<string | null>(null); // 'home' | 'outside' | null
    const [showSuccess, setShowSuccess] = useState(false);

    const handleTrigger = async (location: 'home' | 'outside') => {
        if (!isActive) return;

        setIsTriggering(location);
        setIsOpen(false);

        try {
            const response = await fetch(`/api/persona/${personaId}/activity/manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location }),
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to trigger activity:", error);
        } finally {
            setIsTriggering(null);
        }
    };

    if (!isActive) return null;

    return (
        <div className="relative inline-block">
            <div className="flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={!!isTriggering}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-medium hover:bg-teal-500/20 transition-all group overflow-hidden"
                >
                    {isTriggering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : showSuccess ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <Zap className="w-4 h-4 fill-teal-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-sm">
                        {isTriggering ? 'Triggering...' : showSuccess ? 'Success!' : 'Force Activity'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-48 glass-card rounded-2xl border border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
                        <button
                            onClick={() => handleTrigger('home')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Home className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-medium block">At Home</span>
                                <span className="text-[10px] text-zinc-500">Cozy apartment vibes</span>
                            </div>
                        </button>

                        <div className="h-px bg-white/5 my-1" />

                        <button
                            onClick={() => handleTrigger('outside')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-medium block">Outside</span>
                                <span className="text-[10px] text-zinc-500">Explore the city</span>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
