"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useWaitlist } from "./WaitlistContext";

export function Header() {
    const { openWaitlist } = useWaitlist();

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Livra</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={openWaitlist}
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Log in
                    </button>
                    <button
                        onClick={openWaitlist}
                        className="hidden sm:block btn-glow px-4 py-2 rounded-full text-sm font-medium text-white"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </motion.header>
    );
}

export function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-zinc-800 bg-black">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-zinc-300">Livra</span>
                </div>
                <div className="flex gap-8 text-sm text-zinc-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
                <p className="text-sm text-zinc-600">
                    © 2026 Livra.
                </p>
            </div>
        </footer>
    );
}
