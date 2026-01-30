"use client";

import { X, Check } from "lucide-react";
import { AnimatedSection } from "@/components/animations";

export function ComparisonSection() {
    return (
        <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800">
            <div className="max-w-5xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Why It Works</h2>
                    <p className="text-zinc-400">Real-time Marketing Automation vs. Content Factory</p>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Standard AI Generator */}
                    <AnimatedSection delay={0.1}>
                        <div className="p-8 rounded-2xl border border-zinc-800 bg-black/40 h-full opacity-75 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                            <h3 className="text-xl font-bold text-zinc-500 mb-6 flex items-center gap-2">
                                <X className="w-5 h-5" /> Standard AI Generator
                            </h3>
                            <ul className="space-y-4 text-zinc-500">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2" />
                                    Generates one-off posts
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2" />
                                    No context of the specific day
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2" />
                                    No trend awareness (static prompts)
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2" />
                                    No inherent brand safety
                                </li>
                            </ul>
                        </div>
                    </AnimatedSection>

                    {/* Livra Brand Hero */}
                    <AnimatedSection delay={0.2}>
                        <div className="p-8 rounded-2xl border border-teal-500/30 bg-teal-950/20 h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Check className="w-5 h-5 text-teal-400" /> Livra Brand Hero
                            </h3>
                            <ul className="space-y-4 text-zinc-300 relative z-10">
                                <li className="flex gap-3 items-start">
                                    <Check className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                                    <span>Reacts to <span className="text-white">time, trends, events</span>, and market signals</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <Check className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                                    <span>Creates a <span className="text-white">continuous narrative</span> tailored to the moment</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <Check className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                                    <span>Is the <span className="text-white">official brand representative</span></span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <Check className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                                    <span>Constantly builds presence and engagement automatically</span>
                                </li>
                            </ul>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
}
