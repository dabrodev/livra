"use client";

import { Clock, TrendingUp, Calendar } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/animations";

export function CoreMessageSection() {
    return (
        <section className="py-24 px-6 border-t border-zinc-800 bg-black/40">
            <div className="max-w-4xl mx-auto text-center">
                <AnimatedSection>
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        This is <span className="text-teal-400">JIT Marketing</span>.
                        <br />
                        <span className="text-zinc-500 text-2xl md:text-4xl">Marketing in the moment, not retrospectively.</span>
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed mb-12">
                        Other generators create batched posts based on prompts from a week ago.
                        <br />
                        <strong>Livra generates content "here and now"</strong>, reacting to current trends, daily events,
                        and seasonal moments. It's fully autonomous.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid md:grid-cols-3 gap-6 text-left">
                    {[
                        { icon: Clock, title: "Real-Time", desc: "Reacts to today's news and timestamps." },
                        { icon: TrendingUp, title: "Trend Aware", desc: "Understands what's viral right now." },
                        { icon: Calendar, title: "Contextual", desc: "Knows the season, holiday, and time of day." }
                    ].map((item, i) => (
                        <StaggerItem key={i}>
                            <div className="glass-card p-6 rounded-xl flex flex-col gap-4 hover:border-teal-500/30 transition-colors h-full">
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    <item.icon className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="text-sm text-zinc-400">{item.desc}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
