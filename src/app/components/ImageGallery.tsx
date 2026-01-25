"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Portal from "./Portal";

interface GalleryImage {
    url: string;
    description?: string;
}

interface ImageGalleryProps {
    images: GalleryImage[];
    initialIndex: number;
    onClose: () => void;
}

export default function ImageGallery({ images, initialIndex, onClose }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrevious = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, handlePrevious, handleNext]);

    if (!images.length) return null;

    const currentImage = images[currentIndex];

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 md:p-10 select-none"
                onClick={onClose}
            >
                {/* Close button */}
                <button
                    className="absolute top-6 right-6 p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors z-[100000]"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Left arrow */}
                {images.length > 1 && (
                    <button
                        className="absolute left-4 md:left-10 p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all z-[100000] hover:scale-110 active:scale-95"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                )}

                {/* Right arrow */}
                {images.length > 1 && (
                    <button
                        className="absolute right-4 md:right-10 p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all z-[100000] hover:scale-110 active:scale-95"
                        onClick={handleNext}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                )}

                {/* Main image content */}
                <div
                    className="relative max-w-full max-h-full flex flex-col items-center justify-center animate-in zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        key={currentImage.url} // Key forces re-animation on change
                        src={currentImage.url}
                        alt={currentImage.description || "Gallery image"}
                        className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/5"
                    />

                    {currentImage.description && (
                        <div className="mt-4 text-center max-w-2xl px-6">
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                                {currentImage.description}
                            </p>
                            <span className="text-zinc-500 text-xs mt-2 block">
                                {currentIndex + 1} / {images.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
}
