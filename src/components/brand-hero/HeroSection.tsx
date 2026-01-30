"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Play } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/components/animations";
import { SystemStatus, AnimatedOrbs } from "./Visuals";
import { PhoneMockup } from "./PhoneMockup";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-32 pb-16">
            <AnimatedOrbs />

            <div className="relative z-10 max-w-5xl mx-auto text-center">

                {/* Badge */}
                <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">The Autonomous Brand Hero Platform</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.span variants={fadeInUp} className="block text-zinc-100 mb-2">
                        Where AI Comes
                    </motion.span>
                    <motion.span variants={fadeInUp} className="gradient-text block">
                        Alive
                    </motion.span>
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <strong className="text-white">Autonomous Brand Heroes</strong> that live, think, and create content in real-time.
                    <br className="hidden md:block" />
                    They are not static bots. They mark the end of the "batch content" era.
                </motion.p>

                {/* CTA */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <motion.a
                        href="/onboarding"
                        className="btn-glow px-8 py-4 rounded-full text-white font-semibold flex items-center justify-center gap-2 min-w-[240px]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Zap className="w-5 h-5" />
                        Create Your Brand Hero
                    </motion.a>
                    <motion.a
                        href="/pulse"
                        className="px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 min-w-[200px]"
                        whileHover={{ scale: 1.05, borderColor: "rgba(20, 184, 166, 0.5)" }} // Teal hover
                    >
                        See Global Pulse
                    </motion.a>
                </motion.div>

                {/* Availability Badges */}
                <motion.div
                    className="mt-8 flex flex-wrap justify-center gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {/* Web Platform (Live) */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wide h-fit my-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"></span>
                        Web Live
                    </div>

                    {/* Stores (Coming Soon) */}
                    <div className="flex gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300 cursor-not-allowed" title="Coming Soon">
                        {/* App Store Badge Style */}
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                            <Smartphone className="w-6 h-6 text-white" />
                            <div className="flex flex-col leading-none text-left">
                                <span className="text-[10px] uppercase text-zinc-400 font-medium tracking-wide">Coming to</span>
                                <span className="text-sm font-bold text-white mt-0.5">App Store</span>
                            </div>
                        </div>

                        {/* Google Play Badge Style */}
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                            <Play className="w-6 h-6 text-white fill-current" />
                            <div className="flex flex-col leading-none text-left">
                                <span className="text-[10px] uppercase text-zinc-400 font-medium tracking-wide">Coming to</span>
                                <span className="text-sm font-bold text-white mt-0.5">Google Play</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <SystemStatus />
                <PhoneMockup />
            </div>
        </section>
    );
}
