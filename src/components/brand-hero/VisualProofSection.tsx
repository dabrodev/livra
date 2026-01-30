"use client";

import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function VisualProofSection() {
    // Julia's Day (Aura Activewear)
    const juliaTimeline = [
        {
            src: "/examples/workout.png",
            context: "🌦️ 8°C Morning mist",
            action: "Early yoga flow. Promoting thermal collection.",
            time: "07:15:22"
        },
        {
            src: "/examples/cafe.png",
            context: "☕ Coffee Break",
            action: "Checking manufacturing updates. 'Sustainable seamless' tease.",
            time: "10:30:15"
        },
        {
            src: "/examples/city.png",
            context: "🚦 Evening Commute",
            action: "Transit comfort test. Highlighting breathable layers.",
            time: "18:45:11"
        },
        {
            src: "/examples/dinner.png",
            context: "🎉 Social Hour",
            action: "Aura After-Dark. 'From gym to gin' styling tips.",
            time: "20:30:00"
        },
    ];

    // Marcus's Day (Nomad OS) - Using correct male assets
    const marcusTimeline = [
        {
            src: "/examples/male_gym.png",
            context: "🧘‍♂️ Mental Reset",
            action: "Pre-market meditation & workout. 'Clarity before code.'",
            time: "06:45:10"
        },
        {
            src: "/examples/male_coffee.png",
            context: "💻 Remote HQ",
            action: "Deep work sprint at local hub. Analysis of Q3 user trends.",
            time: "11:15:44"
        },
        {
            src: "/examples/male_rooftop.png",
            context: "🏙️ Tech Hub Meetup",
            action: "Roof session with founders. Discussing async culture.",
            time: "17:20:33"
        },
        {
            src: "/examples/male_cooking.png",
            context: "🥗 Meal Prep",
            action: "Unwinding with nutrition. 'Fuel for the mind.'",
            time: "20:00:00"
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

                {/* JULIA ROW */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <span className="font-bold text-teal-400">J</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Julia <span className="text-zinc-500 font-normal">for Aura Activewear</span></h3>
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Lifestyle & Wellness Archetype</p>
                        </div>
                    </div>

                    <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {juliaTimeline.map((item, i) => (
                            <StaggerItem key={i}>
                                <HeroCard item={item} color="teal" />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>

                {/* MARCUS ROW */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <span className="font-bold text-indigo-400">M</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Marcus <span className="text-zinc-500 font-normal">for Nomad OS</span></h3>
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Tech & Productivity Archetype</p>
                        </div>
                    </div>

                    <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {marcusTimeline.map((item, i) => (
                            <StaggerItem key={i + 10}>
                                <HeroCard item={item} color="indigo" />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>
        </section>
    );
}

function HeroCard({ item, color }: { item: any, color: "teal" | "indigo" }) {
    const borderColor = color === "teal" ? "border-teal-500/30" : "border-indigo-500/30";
    const bgBadge = color === "teal" ? "bg-teal-500/20 text-teal-200" : "bg-indigo-500/20 text-indigo-200";
    const textAccent = color === "teal" ? "text-teal-400" : "text-indigo-400";
    const hoverColor = color === "teal" ? "rgba(20, 184, 166, 0.3)" : "rgba(99, 102, 241, 0.3)";

    return (
        <motion.div
            className="bg-zinc-900/40 rounded-xl overflow-hidden border border-white/5 group h-full flex flex-col relative"
            whileHover={{ y: -5, borderColor: hoverColor }}
        >
            {/* Image Area */}
            <div className="aspect-[3/4] relative overflow-hidden">
                <img
                    src={item.src}
                    alt="Action"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                {/* Context Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-medium text-zinc-300">
                    {item.context}
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col flex-1 gap-2 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pb-1">
                    <span className={`font-bold ${textAccent}`}>{item.time}</span>
                    <span className="flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${color === 'teal' ? 'bg-teal-500' : 'bg-indigo-500'}`} />
                        POSTED
                    </span>
                </div>

                <p className="text-sm text-zinc-300 leading-snug font-medium">
                    {item.action}
                </p>
            </div>
        </motion.div>
    );
}
