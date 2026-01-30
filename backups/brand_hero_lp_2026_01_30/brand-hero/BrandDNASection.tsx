"use client";

import { motion } from "framer-motion";
import { Fingerprint, Network, Sparkles } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function BrandDNASection() {
    const steps = [
        {
            num: "01",
            title: "Inject Brand DNA",
            desc: "Upload your brand book, define the archetype, and set the tone-of-voice. The AI internalizes your values to ensure every interaction is on-brand.",
            icon: Fingerprint,
            color: "teal"
        },
        {
            num: "02",
            title: "Context Fusion",
            desc: "The system monitors global trends, industry news, and calendar events in real-time, filtering them through your Brand DNA perspective.",
            icon: Network,
            color: "emerald"
        },
        {
            num: "03",
            title: "Living Narrative",
            desc: "Your Hero autonomously creates content, reacts to comments, and builds a consistent story over time—autonomous by default, with optional HITL approval workflow.",
            icon: Sparkles,
            color: "cyan"
        }
    ];

    return (
        <section className="py-24 px-6 border-t border-zinc-800">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Powered by <span className="gradient-text">Your Brand DNA</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        How we turn a static logo into a living, breathing digital representative.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                className="glass-card p-8 rounded-2xl h-full border border-white/5 relative overflow-hidden group"
                                whileHover={{ y: -5, borderColor: `rgba(${step.color === 'teal' ? '20, 184, 166' : step.color === 'emerald' ? '16, 185, 129' : '34, 211, 238'}, 0.3)` }}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-${step.color}-500/10 flex items-center justify-center mb-6`}>
                                    <step.icon className={`w-7 h-7 text-${step.color}-400`} />
                                </div>
                                <div className="absolute top-6 right-8 text-4xl font-bold text-white/5 font-mono">
                                    {step.num}
                                </div>

                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    {step.desc}
                                </p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
