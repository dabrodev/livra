"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Smartphone, Play } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/components/animations";
import { SystemStatus, AnimatedOrbs } from "./Visuals";
import { PhoneMockup } from "./PhoneMockup";
import { useWaitlist } from "./WaitlistContext";

export function HeroSection() {
    const { openWaitlist } = useWaitlist();

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
                    className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <button
                        onClick={openWaitlist}
                        className="relative group overflow-hidden px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 min-w-[240px] text-white bg-gradient-to-r from-teal-500 to-emerald-600 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full" />
                        <Zap className="w-5 h-5 fill-current" />
                        Create Your Brand Hero
                    </button>

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

                {/* Integrations Footer */}
                <motion.div
                    className="mt-16 pt-8 border-t border-white/5 w-full max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-6">Seamlessly Publishing To</p>
                    <div className="flex justify-center items-center gap-8 md:gap-12">
                        {/* Instagram */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-black transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">Instagram</span>
                        </div>

                        {/* TikTok */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-black transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">TikTok</span>
                        </div>

                        {/* X / Twitter */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-black transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">X</span>
                        </div>

                        {/* Threads */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-black transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 16 16"><path d="M6.321 6.016c-0.27 -0.18 -1.166 -0.802 -1.166 -0.802 0.756 -1.081 1.753 -1.502 3.132 -1.502 0.975 0 1.803 0.327 2.394 0.948s0.928 1.509 1.005 2.644q0.492 0.207 0.905 0.484c1.109 0.745 1.719 1.86 1.719 3.137 0 2.716 -2.226 5.075 -6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55 0.243 15 5.036l-1.36 0.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0 -5.582 2.171 -5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847 -1.443 4.847 -3.556 0 -1.438 -1.208 -2.127 -1.27 -2.127 -0.236 1.234 -0.868 3.31 -3.644 3.31 -1.618 0 -3.013 -1.118 -3.013 -2.582 0 -2.09 1.984 -2.847 3.55 -2.847 0.586 0 1.294 0.04 1.663 0.114 0 -0.637 -0.54 -1.728 -1.9 -1.728 -1.25 0 -1.566 0.405 -1.967 0.868ZM8.716 8.19c-2.04 0 -2.304 0.87 -2.304 1.416 0 0.878 1.043 1.168 1.6 1.168 1.02 0 2.067 -0.282 2.232 -2.423a6.2 6.2 0 0 0 -1.528 -0.161" strokeWidth="1"></path></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">Threads</span>
                        </div>

                        {/* Bluesky */}
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-black transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <svg className="w-6 h-6 text-white fill-current py-1" viewBox="0 0 24 24"><path d="M12 10.8c-1.087 -2.114 -4.046 -6.053 -6.798 -7.995C2.566 0.944 1.561 1.266.902 1.565 0.139 1.908 0 3.08 0 3.768c0 0.69 0.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136 -0.02 0.275 -0.039 0.415 -0.056 -0.138 0.022 -0.276 0.04 -0.415 0.056 -3.912 0.58 -7.387 2.005 -2.83 7.078 5.013 5.19 6.87 -1.113 7.823 -4.308 0.953 3.195 2.05 9.271 7.733 4.308 4.267 -4.308 1.172 -6.498 -2.74 -7.078a8.741 8.741 0 0 1 -0.415 -0.056c0.14 0.017 0.279 0.036 0.415 0.056 2.67 0.297 5.568 -0.628 6.383 -3.364 0.246 -0.828 0.624 -5.79 0.624 -6.478 0 -0.69 -0.139 -1.861 -0.902 -2.206 -0.659 -0.298 -1.664 -0.62 -4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" /></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">Bluesky</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
