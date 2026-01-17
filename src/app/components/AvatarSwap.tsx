"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X, Check, Library, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Portal from "./Portal";

interface Avatar {
    id: string;
    url: string;
    hairColor?: string;
    skinTone?: string;
}

interface AvatarSwapProps {
    personaId: string;
    currentAvatarUrl?: string;
}

export default function AvatarSwap({ personaId, currentAvatarUrl }: AvatarSwapProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchAvatars();
        }
    }, [isOpen]);

    const fetchAvatars = async () => {
        setIsLoading(true);
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

    const handleSelectAvatar = async (avatar: Avatar) => {
        setIsSaving(true);
        try {
            await fetch(`/api/persona/${personaId}/avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: avatar.url }),
            });
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to save avatar:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-all"
                title="Change Avatar"
            >
                <RefreshCw className="w-5 h-5" />
            </button>

            {/* Modal */}
            {isOpen && (
                <Portal>
                    <div
                        className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="bg-zinc-900 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Library className="w-5 h-5 text-teal-400" />
                                    <h2 className="font-semibold">Change Avatar</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-zinc-400">Loading avatars...</p>
                                    </div>
                                ) : avatars.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-zinc-400 mb-4">No avatars in library</p>
                                        <a
                                            href={`/persona/${personaId}/avatar`}
                                            className="text-teal-400 hover:underline"
                                        >
                                            Generate new avatars
                                        </a>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                        {avatars.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => handleSelectAvatar(avatar)}
                                                disabled={isSaving}
                                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative group ${currentAvatarUrl === avatar.url
                                                    ? "border-teal-500 ring-2 ring-teal-500/30"
                                                    : "border-zinc-800 hover:border-teal-500/50"
                                                    } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={avatar.url}
                                                    alt="Avatar option"
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                {currentAvatarUrl === avatar.url && (
                                                    <div className="absolute inset-0 bg-teal-500/30 flex items-center justify-center">
                                                        <div className="bg-teal-500 rounded-full p-1 shadow-lg">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                {isSaving && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center bg-zinc-900">
                                <a
                                    href={`/persona/${personaId}/avatar`}
                                    className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    + Generate new
                                </a>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}
