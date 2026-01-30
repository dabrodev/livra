"use client";

import { motion } from "framer-motion";
import { Brain, Zap, ShieldCheck } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function ValuePropsSection() {
    const values = [
        {
            title: "Autonomous Brand Hero",
            subtitle: "Not a generator, but a living system",
            desc: "Works 24/7. Creates narratives identifying with your brand voice & tone. It doesn't just 'make content'—it leads the brand existence in real-time.",
            icon: Brain,
            color: "teal"
        },
        {
            title: "Real-Time Intelligence",
            subtitle: "No more stale presets",
            desc: "Your avatar understands what is happening NOW. It creates communication relevant to the specific day, time, and trend. Zero batching.",
            icon: Zap,
            color: "emerald"
        },
        {
            title: "Virtual Ambassador",
            subtitle: "Official, consistent, scalable",
            desc: "Represents brand values and reacts to the world like a 'brand human' in the digital space. A permanent asset, not a temporary creator.",
            icon: ShieldCheck,
            color: "cyan"
        }
    ];

    return (
        <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="mb-16 text-center">
                    <h2 className="text-3xl font-bold">The Pillars of <span className="gradient-text">Autonomous Presence</span></h2>
                </AnimatedSection>

                <StaggerContainer className="grid md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                className="glass-card p-8 rounded-2xl h-full border border-white/5 relative overflow-hidden group"
                                whileHover={{ y: -5, borderColor: `rgba(${v.color === 'teal' ? '20, 184, 166' : v.color === 'emerald' ? '16, 185, 129' : '34, 211, 238'}, 0.3)` }}
                            >
                                <div className={`absolute top-0 right-0 p-32 bg-${v.color}-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-80`} />

                                <v.icon className={`w-12 h-12 mb-6 text-${v.color}-400`} />
                                <h3 className="text-2xl font-bold mb-2">{v.title}</h3>
                                <div className={`text-sm font-mono text-${v.color}-400 mb-4 uppercase tracking-wider`}>{v.subtitle}</div>
                                <p className="text-zinc-400 leading-relaxed">
                                    {v.desc}
                                </p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
