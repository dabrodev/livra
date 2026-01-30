"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PhoneMockup() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Using diverse instances with dynamic status based on roughly current world time/role
    // Using diverse instances with dynamic status based on roughly current world time/role
    const instances = [
        { src: "/examples/phone_gaming.png", id: "NEON_V1", brand: "CyberGear", role: "Streamer AI", loc: "Seoul", status: "STREAMING" },
        { src: "/examples/phone_travel.png", id: "ATLAS_07", brand: "Summit Expeditions", role: "Travel Guide", loc: "Andes", status: "EXPLORING" },
        { src: "/examples/phone_food.png", id: "CHEF_AI", brand: "Umami Collective", role: "Culinary Artist", loc: "Kyoto", status: "PLATING" },
        { src: "/examples/phone_music.png", id: "LUNA_DJ", brand: "SoundWave Events", role: "Music Curator", loc: "Ibiza", status: "MIXING" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev: number) => (prev + 1) % instances.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [instances.length]);

    const current = instances[currentIndex];

    // Helper to determine status styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SLEEPING": return { color: "text-indigo-400", bg: "bg-indigo-500", dotAnimation: "" };
            case "ANALYZING": return { color: "text-amber-400", bg: "bg-amber-500", dotAnimation: "animate-pulse" };
            case "STREAMING": return { color: "text-fuchsia-400", bg: "bg-fuchsia-500", dotAnimation: "animate-pulse" };
            case "EXPLORING": return { color: "text-orange-400", bg: "bg-orange-500", dotAnimation: "animate-pulse" };
            case "PLATING": return { color: "text-emerald-400", bg: "bg-emerald-500", dotAnimation: "animate-pulse" };
            case "MIXING": return { color: "text-cyan-400", bg: "bg-cyan-500", dotAnimation: "animate-pulse" };
            default: return { color: "text-green-400", bg: "bg-green-500", dotAnimation: "animate-pulse" };
        }
    };

    const statusStyle = getStatusStyle(current.status);

    return (
        <motion.div
            className="relative mt-12 md:mt-20 w-full flex justify-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
        >
            {/* Floating animation wrapper */}
            <motion.div
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto"
            >
                <div
                    className="w-64 h-[480px] rounded-[3rem] bg-zinc-900 border-4 border-zinc-800 overflow-hidden relative"
                    style={{
                        boxShadow: "0 0 40px rgba(20, 184, 166, 0.15)" // Teal glow
                    }}
                >
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />

                    {/* Screen with rotating portrait images */}
                    <div className="absolute inset-1 rounded-[2.8rem] overflow-hidden bg-zinc-800 z-10">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={current.src}
                                src={current.src}
                                alt={`Instance ${current.id}`}
                                className={`w-full h-full object-cover transition-all duration-700 ${current.status === 'SLEEPING' ? 'grayscale-[0.5] brightness-75' : ''}`}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>

                        {/* Technical Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                        {/* Top System Status */}
                        <div className={`absolute top-8 left-0 right-0 px-6 flex justify-between items-center text-[10px] font-mono ${statusStyle.color}`}>
                            <span className="flex items-center gap-1.5 transition-colors duration-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg} ${statusStyle.dotAnimation}`} />
                                {current.status}
                            </span>
                            <span>AUTH_LEVEL_9</span>
                        </div>

                        {/* Bottom Instance Data */}
                        <div className="absolute bottom-6 left-6 right-6 font-mono">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-lg font-bold text-white mb-0.5 tracking-tight">{current.id}</div>
                                    <div className="text-xs font-bold text-teal-400 mb-2 uppercase tracking-wide">{current.brand}</div>
                                    <div className="flex flex-col gap-0.5 text-[10px] text-zinc-400 font-mono">
                                        <div className="flex justify-between border-b border-white/5 pb-0.5">
                                            <span>ROLE:</span>
                                            <span className="text-zinc-200">{current.role}</span>
                                        </div>
                                        <div className="flex justify-between pt-0.5">
                                            <span>LOC:</span>
                                            <span className="text-zinc-200">{current.loc}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
