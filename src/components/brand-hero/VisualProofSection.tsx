"use client";

import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function VisualProofSection() {
    // Brand Hero Scenarios (4 distinct 'Power Moments' - Action Focused)
    const scenarios = [
        {
            src: "/examples/action_volt.png",
            brand: "Volt E-Scooters",
            context: "⚡ 18km/h Bypass",
            action: "Weaving through gridlock. Calculating fastest route in real-time.",
            time: "08:45:11"
        },
        {
            src: "/examples/action_luxe.png",
            brand: "Luxe Dining App",
            context: "💎 VIP Access",
            action: "Instant reservation confirmation at fully booked Michelin spot.",
            time: "20:30:00"
        },
        {
            src: "/examples/action_nova.png",
            brand: "Nova FinTech",
            context: "📈 Buy Signal",
            action: "Executing automated trade precisely at the market dip.",
            time: "14:15:05"
        },
        {
            src: "/examples/action_pure.png",
            brand: "Pure Threads",
            context: "🌿 Texture Audit",
            action: "Verifying fabric integrity and organic certification scan.",
            time: "11:10:22"
        },
    ];

    return (
        <section id="gallery" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Brand Hero <span className="gradient-text">in Action</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        See how Autonomous Heroes connect real-world context with brand messaging across industries.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {scenarios.map((item, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                className="bg-zinc-900/50 rounded-xl overflow-hidden border border-white/5 group h-full flex flex-col relative"
                                whileHover={{ y: -5, borderColor: "rgba(20, 184, 166, 0.3)" }}
                            >
                                {/* Image Area */}
                                <div className="aspect-[3/4] relative overflow-hidden">
                                    <img
                                        src={item.src}
                                        alt={item.brand}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                        <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10 uppercase tracking-wide">
                                            {item.brand}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 bg-teal-500/20 backdrop-blur-md border border-teal-500/30 px-2 py-1 rounded text-[10px] font-medium text-teal-100 flex items-center gap-1.5">
                                        <span>{item.context}</span>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-1 gap-2">
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono border-b border-white/5 pb-2">
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            EXECUTED
                                        </span>
                                        <span>{item.time}</span>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-snug font-medium">
                                        {item.action}
                                    </p>
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
