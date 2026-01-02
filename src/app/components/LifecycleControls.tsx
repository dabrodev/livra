"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { useRouter } from "next/navigation";

interface LifecycleControlsProps {
    influencerId: string;
    initialIsActive: boolean;
}

export default function LifecycleControls({ influencerId, initialIsActive }: LifecycleControlsProps) {
    const [isActive, setIsActive] = useState(initialIsActive);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async () => {
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

    return (
        <button
            onClick={toggleStatus}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all ${isActive
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isActive ? "Pause Lifecycle" : "Start Lifecycle"}
        >
            {isActive ? (
                <Pause className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            ) : (
                <Play className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
            )}
        </button>
    );
}
