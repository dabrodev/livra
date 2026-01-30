"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function SystemStatus() {
    return (
        <motion.div
            className="w-full max-w-3xl mx-auto mt-16 p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs md:text-sm text-zinc-400 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-green-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-bold tracking-wider">SYSTEM ONLINE</span>
                    </div>
                    <span className="hidden md:inline text-zinc-700">|</span>
                    <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span>GLOBAL_PULSE_CONNECTED</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-8 w-full md:w-auto font-mono text-zinc-500 whitespace-nowrap">
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>CONTEXT:</span>
                        <span className="text-zinc-300">REAL-TIME</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>AWARENESS:</span>
                        <span className="text-zinc-300">HIGH</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function AnimatedOrbs() {
    return (
        <>
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
        </>
    );
}
