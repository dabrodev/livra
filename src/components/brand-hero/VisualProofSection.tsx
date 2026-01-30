"use client";

import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function VisualProofSection() {
    // Julia - Lifestyle
    const juliaExamples = [
        { src: "/examples/workout.png", action: "Morning Yoga Routine", time: "07:15:22" },
        { src: "/examples/cafe.png", action: "Check-in: Crypto Cafe", time: "09:32:04" },
        { src: "/examples/city.png", action: "Transit: Downtown", time: "18:45:11" },
        { src: "/examples/dinner.png", action: "Social: Dinner Event", time: "20:30:00" },
    ];

    return (
        <section id="gallery" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Visual <span className="gradient-text">Proof</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Content generated autonomously, in real-time context.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {juliaExamples.map((example, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                className="bg-black/20 rounded-xl p-2 border border-white/5 group"
                                whileHover={{ y: -5, borderColor: "rgba(20, 184, 166, 0.3)" }} // Teal hover
                            >
                                <div className="rounded-lg overflow-hidden aspect-[3/4] mb-3 relative">
                                    <img
                                        src={example.src}
                                        alt="Agent action"
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="font-mono text-[10px] text-zinc-500 space-y-1.5 px-1 py-1">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                        <span className="text-emerald-500 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Live
                                        </span>
                                        <span className="text-zinc-600">{example.time}</span>
                                    </div>
                                    <div className="text-zinc-300 font-medium leading-relaxed">
                                        {example.action}
                                    </div>
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
