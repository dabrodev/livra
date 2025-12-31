"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 transition-colors z-[110]"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <div
                        className="max-w-4xl max-h-[90vh] animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
