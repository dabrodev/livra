"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Play, Pause, Sparkles, Moon, Brain, Camera, Zap, Coffee, type LucideIcon } from "lucide-react";

interface RealtimeActivityStatusProps {
    personaId: string;
    initialLifecycleStatus: string | null;
    initialLifecycleStartedAt: Date | null;
    initialCurrentActivity: string | null;
    initialActivityDetails: string | null;
}

// Lifecycle Status Badge (user-controlled: new/running/paused)
function getLifecycleStatusConfig(lifecycleStatus: string | null, lifecycleStartedAt: Date | null) {
    if (!lifecycleStartedAt) {
        return { label: "New", color: "text-zinc-400 bg-zinc-400/10", icon: Sparkles };
    }
    if (lifecycleStatus === 'running') {
        return { label: "Running", color: "text-green-400 bg-green-400/10", icon: Play };
    }
    return { label: "Paused", color: "text-orange-400 bg-orange-400/10", icon: Pause };
}

// Activity Status Badge (system-controlled: what avatar is doing now)
function getActivityStatusConfig(currentActivity: string | null): { label: string; color: string; icon: LucideIcon } | null {
    switch (currentActivity) {
        case 'sleeping':
            return { label: "Sleeping", color: "text-indigo-400 bg-indigo-400/10", icon: Moon };
        case 'planning':
            return { label: "Planning", color: "text-amber-400 bg-amber-400/10", icon: Brain };
        case 'creating':
            return { label: "Creating", color: "text-pink-400 bg-pink-400/10", icon: Camera };
        case 'active':
            return { label: "Active", color: "text-green-400 bg-green-400/10", icon: Zap };
        case 'resting':
            return { label: "Resting", color: "text-cyan-400 bg-cyan-400/10", icon: Coffee };
        default:
            return null;
    }
}

export default function RealtimeActivityStatus({
    personaId,
    initialLifecycleStatus,
    initialLifecycleStartedAt,
    initialCurrentActivity,
    initialActivityDetails,
}: RealtimeActivityStatusProps) {
    const [lifecycleStatus, setLifecycleStatus] = useState(initialLifecycleStatus);
    const [lifecycleStartedAt, setLifecycleStartedAt] = useState(initialLifecycleStartedAt);
    const [currentActivity, setCurrentActivity] = useState(initialCurrentActivity);
    const [activityDetails, setActivityDetails] = useState(initialActivityDetails);
    const [isConnected, setIsConnected] = useState(false);

    // Load latest status (to catch up after disconnect)
    const refreshStatus = useCallback(async () => {
        console.log('[RealtimeActivityStatus] Refreshing status to catch up...');
        try {
            const response = await fetch(`/api/persona/${personaId}`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success && data.persona) {
                const p = data.persona;
                setLifecycleStatus(p.lifecycleStatus);
                setLifecycleStartedAt(p.lifecycleStartedAt ? new Date(p.lifecycleStartedAt) : null);
                setCurrentActivity(p.currentActivity);
                setActivityDetails(p.activityDetails);
            }
        } catch (error) {
            console.error('[RealtimeActivityStatus] Refresh failed:', error);
        }
    }, [personaId]);

    // Subscribe to real-time updates on Persona table
    useEffect(() => {
        const channel = supabase
            .channel(`persona-status-${personaId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Persona',
                    // Note: Server-side filter removed as it doesn't work reliably with UUIDs
                    // Client-side filtering is used instead
                },
                (payload) => {
                    const receivedId = (payload.new as { id?: string })?.id;

                    // Client-side filtering - only process our persona
                    if (receivedId !== personaId) {
                        return;
                    }


                    if (payload.eventType !== 'UPDATE') return;
                    const updated = payload.new as {
                        lifecycleStatus?: string;
                        lifecycleStartedAt?: string;
                        currentActivity?: string;
                        activityDetails?: string;
                    };

                    if (updated.lifecycleStatus !== undefined) {
                        setLifecycleStatus(updated.lifecycleStatus);
                    }
                    if (updated.lifecycleStartedAt !== undefined) {
                        setLifecycleStartedAt(updated.lifecycleStartedAt ? new Date(updated.lifecycleStartedAt) : null);
                    }
                    if (updated.currentActivity !== undefined) {
                        setCurrentActivity(updated.currentActivity);
                    }
                    if (updated.activityDetails !== undefined) {
                        setActivityDetails(updated.activityDetails);
                    }
                }
            )
            .subscribe(async (status, err) => {
                if (err) console.error('[RealtimeActivityStatus] Subscription error:', err);

                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    // Refresh when (re)subscribed
                    await refreshStatus();
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsConnected(false);
                }
            });

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [personaId, refreshStatus]);

    const lifecycleConfig = getLifecycleStatusConfig(lifecycleStatus, lifecycleStartedAt);
    const activityConfig = lifecycleStatus === 'running' ? getActivityStatusConfig(currentActivity) : null;
    const LifecycleIcon = lifecycleConfig.icon;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Lifecycle Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${lifecycleConfig.color}`}>
                <LifecycleIcon className="w-3 h-3" />
                {lifecycleConfig.label}
            </span>

            {/* Activity Status Badge (only when running) */}
            {activityConfig && (() => {
                const ActivityIcon = activityConfig.icon;
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${activityConfig.color}`}
                        title={activityDetails || undefined}
                    >
                        <ActivityIcon className="w-3 h-3" />
                        {activityConfig.label}
                    </span>
                );
            })()}

            {/* Realtime indicator */}
            {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Live updates" />
            )}
        </div>
    );
}
