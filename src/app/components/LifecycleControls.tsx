"use client";

import { useState } from "react";
import { Play, Pause, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface LifecycleControlsProps {
    influencerId: string;
    initialIsActive: boolean;
    hasAvatar: boolean;
}

export default function LifecycleControls({ influencerId, initialIsActive, hasAvatar }: LifecycleControlsProps) {
    const [isActive, setIsActive] = useState(initialIsActive);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async () => {
        // Prevent starting without avatar
        if (!isActive && !hasAvatar) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/influencer/${influencerId}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: !isActive }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsActive(data.active);
                // Refresh the page data to sync other components if needed
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to toggle status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Can't start without avatar
    const canStart = hasAvatar || isActive;
    const buttonTitle = !hasAvatar && !isActive
        ? "Create an avatar first to start the lifecycle"
        : isActive
            ? "Pause Lifecycle"
            : "Start Lifecycle";

    return (
        <button
            onClick={toggleStatus}
            disabled={isLoading || !canStart}
            className={`p-3 rounded-xl transition-all ${isActive
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                : canStart
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={buttonTitle}
        >
            {isActive ? (
                <Pause className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            ) : !canStart ? (
                <AlertCircle className="w-5 h-5" />
            ) : (
                <Play className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            )}
        </button>
    );
}
