"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Zap, Brain, Globe, Server, Activity, Clock, TrendingUp, ShieldCheck, Check, X, Calendar, Fingerprint, Grip, Network } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem, fadeInUp, fadeIn, staggerContainer } from "@/components/animations";

// --- REUSED COMPONENTS & HELPERS ---

// 1. System Status (Alive Indicator)
function SystemStatus() {
    return (
        <motion.div
            className="w-full max-w-3xl mx-auto mt-16 p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs md:text-sm text-zinc-400 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-green-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-bold tracking-wider">SYSTEM ONLINE</span>
                    </div>
                    <span className="hidden md:inline text-zinc-700">|</span>
                    <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span>GLOBAL_PULSE_CONNECTED</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-8 w-full md:w-auto font-mono text-zinc-500 whitespace-nowrap">
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>CONTEXT:</span>
                        <span className="text-zinc-300">REAL-TIME</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>AWARENESS:</span>
                        <span className="text-zinc-300">HIGH</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// 2. Animated Orbs Background
function AnimatedOrbs() {
    return (
        <>
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
        </>
    );
}

// 3. Animated phone mockup with rotating influencers
function PhoneMockup() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Using diverse instances with dynamic status based on roughly current world time/role
    const instances = [
        { src: "/examples/cafe.png", id: "JULIA_X9", role: "Lifestyle Avatar", loc: "NYC", status: "ACTIVE" },
        { src: "/examples/male_cooking.png", id: "MARCUS_B2", role: "Lifestyle Avatar", loc: "Berlin", status: "ACTIVE" },
        { src: "/portraits/asian_female.png", id: "YUKI_T8", role: "Creative Avatar", loc: "Tokyo", status: "SLEEPING" },
        { src: "/portraits/black_male.png", id: "KWAME_04", role: "Tech Analyst", loc: "Lagos", status: "ANALYZING" },
        { src: "/portraits/latina.png", id: "SOFIA_L1", role: "Wellness Coach", loc: "São Paulo", status: "ACTIVE" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev: number) => (prev + 1) % instances.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [instances.length]);

    const current = instances[currentIndex];

    // Helper to determine status styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SLEEPING": return { color: "text-indigo-400", bg: "bg-indigo-500", dotAnimation: "" };
            case "ANALYZING": return { color: "text-amber-400", bg: "bg-amber-500", dotAnimation: "animate-pulse" };
            default: return { color: "text-green-400", bg: "bg-green-500", dotAnimation: "animate-pulse" };
        }
    };

    const statusStyle = getStatusStyle(current.status);

    return (
        <motion.div
            className="relative mt-12 md:mt-20 w-full flex justify-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
        >
            {/* Floating animation wrapper */}
            <motion.div
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto"
            >
                <div
                    className="w-64 h-[480px] rounded-[3rem] bg-zinc-900 border-4 border-zinc-800 overflow-hidden relative"
                    style={{
                        boxShadow: "0 0 40px rgba(20, 184, 166, 0.15)" // Teal glow
                    }}
                >
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />

                    {/* Screen with rotating portrait images */}
                    <div className="absolute inset-1 rounded-[2.8rem] overflow-hidden bg-zinc-800 z-10">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={current.src}
                                src={current.src}
                                alt={`Instance ${current.id}`}
                                className={`w-full h-full object-cover transition-all duration-700 ${current.status === 'SLEEPING' ? 'grayscale-[0.5] brightness-75' : ''}`}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>

                        {/* Technical Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                        {/* Top System Status */}
                        <div className={`absolute top-8 left-0 right-0 px-6 flex justify-between items-center text-[10px] font-mono ${statusStyle.color}`}>
                            <span className="flex items-center gap-1.5 transition-colors duration-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg} ${statusStyle.dotAnimation}`} />
                                {current.status}
                            </span>
                            <span>AUTH_LEVEL_9</span>
                        </div>

                        {/* Bottom Instance Data */}
                        <div className="absolute bottom-6 left-6 right-6 font-mono">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-lg font-bold text-white mb-1 tracking-tight">{current.id}</div>
                                    <div className="flex flex-col gap-0.5 text-xs text-zinc-400">
                                        <div className="flex justify-between">
                                            <span>ROLE:</span>
                                            <span className="text-zinc-200">{current.role}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>LOC:</span>
                                            <span className="text-zinc-200">{current.loc}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// 4. Gallery Section (Visual Proof)
function GallerySection() {
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

// --- NEW SECTIONS WITH INTEGRATED VISUALS ---

// Hero Section: Real-Time AI Brand Heroes
function HeroSection() {
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

                <SystemStatus />
                <PhoneMockup />
            </div>
        </section>
    );
}

// Core Message: JIT Marketing vs Static
function CoreMessageSection() {
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

// Value Props
function ValuePropsSection() {
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

// Comparison Section
function ComparisonSection() {
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

// How It Works: Brand DNA Engine
function BrandDNASection() {
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

// Header
function Header() {
    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Livra</span>
                </a>

                <div className="flex items-center gap-4">
                    <a href="/pulse" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        Live Pulse
                    </a>
                    <a href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        Log in
                    </a>
                    <a
                        href="/onboarding"
                        className="hidden sm:block btn-glow px-4 py-2 rounded-full text-sm font-medium text-white"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </motion.header>
    );
}

// Footer
function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-zinc-800 bg-black">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-zinc-300">Livra</span>
                </div>
                <div className="flex gap-8 text-sm text-zinc-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
                <p className="text-sm text-zinc-600">
                    © 2026 Livra.
                </p>
            </div>
        </footer>
    );
}

// Main Component
export default function BrandHeroLandingPage() {
    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-teal-500/30">
            <Header />
            <HeroSection />
            <CoreMessageSection />
            <GallerySection />
            <ValuePropsSection />
            <ComparisonSection />
            <BrandDNASection />
            <Footer />
        </div>
    );
}
