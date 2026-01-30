"use client";

import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function DayInTheLifeSection() {
    // Brand Hero Scenarios: Timeline Layout
    // Full story (4 items per hero) adapted for wide layout
    const juliaTimeline = [
        {
            src: "/examples/workout.png",
            brand: "Aura Activewear",
            role: "Julia (Brand Hero)",
            context: "🌦️ Morning Chill (8°C)",
            action: "Early run. Promoting thermal gear based on local weather.",
            time: "07:15:22"
        },
        {
            src: "/examples/cafe.png",
            brand: "Aura Activewear",
            role: "Julia (Brand Hero)",
            context: "☕ Mid-Morning Fuel",
            action: "Checking manufacturing updates. 'Sustainable seamless' tease.",
            time: "10:30:15"
        },
        {
            src: "/examples/city.png",
            brand: "Aura Activewear",
            role: "Julia (Brand Hero)",
            context: "🚦 Evening Rush",
            action: "Commuting comfortably. Highlighting breathability in crowded transit.",
            time: "18:45:11"
        },
        {
            src: "/examples/dinner.png",
            brand: "Aura Activewear",
            role: "Julia (Brand Hero)",
            context: "🎉 Social Hour",
            action: "Aura After-Dark. 'From gym to gin' styling tips.",
            time: "20:30:00"
        }
    ];

    // Using correct male assets for Marcus
    const marcusTimeline = [
        {
            src: "/examples/male_gym.png",
            brand: "Nomad Work",
            role: "Marcus (Brand Hero)",
            context: "🧘‍♂️ Mental Reset",
            action: "Pre-market meditation & workout. 'Clarity before code.'",
            time: "06:45:10"
        },
        {
            src: "/examples/male_coffee.png",
            brand: "Nomad Work",
            role: "Marcus (Brand Hero)",
            context: "📉 Market Update",
            action: "Deep work session. 'Stay focused amidst the noise.'",
            time: "13:32:04"
        },
        {
            src: "/examples/male_rooftop.png",
            brand: "Nomad Work",
            role: "Marcus (Brand Hero)",
            context: "🏙️ Tech Hub Meetup",
            action: "Roof session with founders. Discussing async culture.",
            time: "17:20:33"
        },
        {
            src: "/examples/male_cooking.png",
            brand: "Nomad Work",
            role: "Marcus (Brand Hero)",
            context: "🥗 Meal Prep",
            action: "Unwinding with nutrition. 'Fuel for the mind.'",
            time: "20:00:00"
        }
    ];

    return (
        <section className="py-24 px-6 border-t border-zinc-800 bg-zinc-900/10">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        A Day in the <span className="gradient-text">Life</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Watch how our Heroes live through the day, adapting to time and context autonomously.
                    </p>
                </AnimatedSection>

                {/* Storyline A: Aura Activewear */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-zinc-800 flex-1" />
                        <span className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Aura Activewear • Julia</span>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <StaggerContainer className="grid md:grid-cols-2 gap-6">
                        {juliaTimeline.map((item, i) => (
                            <StaggerItem key={i}>
                                <motion.div
                                    className="bg-zinc-900/50 rounded-xl overflow-hidden border border-white/5 group h-full flex flex-col relative aspect-video md:aspect-[2/1]"
                                    whileHover={{ y: -5, borderColor: "rgba(20, 184, 166, 0.3)" }}
                                >
                                    {/* Horizontal Layout for wider cards */}
                                    <div className="flex h-full">
                                        {/* Image Half */}
                                        <div className="w-1/2 relative overflow-hidden">
                                            <img
                                                src={item.src}
                                                alt={item.brand}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[10px] font-medium text-zinc-300">
                                                {item.context}
                                            </div>
                                        </div>

                                        {/* Content Half */}
                                        <div className="w-1/2 p-4 md:p-6 flex flex-col justify-center gap-3">
                                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono border-b border-white/5 pb-2">
                                                <span className="text-teal-400 font-bold">{item.time}</span>
                                            </div>
                                            <p className="text-sm md:text-base text-zinc-200 leading-snug font-medium">
                                                {item.action}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>

                {/* Storyline B: Nomad Work */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-zinc-800 flex-1" />
                        <span className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Nomad Work • Marcus</span>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <StaggerContainer className="grid md:grid-cols-2 gap-6">
                        {marcusTimeline.map((item, i) => (
                            <StaggerItem key={i + 2}>
                                <motion.div
                                    className="bg-zinc-900/50 rounded-xl overflow-hidden border border-white/5 group h-full flex flex-col relative aspect-video md:aspect-[2/1]"
                                    whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.3)" }}
                                >
                                    <div className="flex h-full">
                                        {/* Image Half */}
                                        <div className="w-1/2 relative overflow-hidden">
                                            <img
                                                src={item.src}
                                                alt={item.brand}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[10px] font-medium text-zinc-300">
                                                {item.context}
                                            </div>
                                        </div>

                                        {/* Content Half */}
                                        <div className="w-1/2 p-4 md:p-6 flex flex-col justify-center gap-3">
                                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono border-b border-white/5 pb-2">
                                                <span className="text-emerald-400 font-bold">{item.time}</span>
                                            </div>
                                            <p className="text-sm md:text-base text-zinc-200 leading-snug font-medium">
                                                {item.action}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>
        </section>
    );
}
