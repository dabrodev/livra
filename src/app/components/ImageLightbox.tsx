"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Portal from "./Portal";

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Clickable image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                className={`${className} cursor-zoom-in hover:opacity-90 transition-opacity`}
                onClick={() => setIsOpen(true)}
            />

            {/* Lightbox Modal */}
            {isOpen && (
                <Portal>
                    <div
                        className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 md:p-10"
                        onClick={() => setIsOpen(false)}
                    >
                        <button
                            className="absolute top-6 right-6 p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors z-[100000]"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <div
                            className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl border border-white/5"
                            />
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}
