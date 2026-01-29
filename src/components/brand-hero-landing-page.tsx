"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Zap, Brain, Camera, Video, Menu, Users, Eye, Globe, Server, Activity, Terminal, Layers, Database, Shield, TrendingUp, FileCheck } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem, fadeInUp, fadeIn, staggerContainer } from "@/components/animations";

// 1. Raw System Status (The "Heartbeat" below Hero)
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
                        <span className="font-bold tracking-wider">BRAND HEROS ACTIVE</span>
                    </div>
                    <span className="hidden md:inline text-zinc-700">|</span>
                    <div className="flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        <span>v2.1.0-alpha</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-8 w-full md:w-auto font-mono text-zinc-500 whitespace-nowrap">
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>GENERATED POSTS:</span>
                        <span className="text-zinc-300">14,203</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-2">
                        <span>ENGAGEMENT:</span>
                        <span className="text-zinc-300">+480%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Animated background orbs
function AnimatedOrbs() {
    return (
        <>
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.2, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </>
    );
}

// Animated phone mockup with rotating influencers
function PhoneMockup() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Using diverse instances with dynamic status based on roughly current world time/role
    const instances = [
        { src: "/examples/cafe.png", id: "BRAND_HERO_01", role: "Influencer", loc: "NYC", status: "ENGAGING" },
        { src: "/portraits/nordic_female.png", id: "BRAND_HERO_02", role: "Model", loc: "Stockholm", status: "POSING" },
        { src: "/portraits/black_male.png", id: "BRAND_HERO_03", role: "Expert", loc: "London", status: "EDUCATING" },
        { src: "/examples/male_cooking.png", id: "BRAND_HERO_04", role: "Specialist", loc: "Berlin", status: "CRAFTING" },
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
            case "POSING": return { color: "text-indigo-400", bg: "bg-indigo-500", dotAnimation: "" };
            case "EDUCATING": return { color: "text-amber-400", bg: "bg-amber-500", dotAnimation: "animate-pulse" };
            default: return { color: "text-green-400", bg: "bg-green-500", dotAnimation: "animate-pulse" };
        }
    };

    const statusStyle = getStatusStyle(current.status);

    return (
        <motion.div
            className="relative mt-12 md:mt-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
        >
            {/* Floating animation wrapper */}
            <motion.div
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div
                    className="w-64 h-[480px] rounded-[3rem] bg-zinc-900 border-4 border-zinc-800 overflow-hidden relative"
                    style={{
                        boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)"
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
                                className={`w-full h-full object-cover transition-all duration-700`}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </AnimatePresence>

                        {/* Technical Overlay - Data, not Social */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                        {/* Top System Status */}
                        <div className={`absolute top-8 left-0 right-0 px-6 flex justify-between items-center text-[10px] font-mono ${statusStyle.color}`}>
                            <span className="flex items-center gap-1.5 transition-colors duration-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg} ${statusStyle.dotAnimation}`} />
                                {current.status}
                            </span>
                            <span>99.9% UPTIME</span>
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

// Hero section with animations
function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-32 pb-16">
            <AnimatedOrbs />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">

                {/* Top Badge */}
                <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">Livra: The AI Brand Hero Factory</span>
                </motion.div>

                {/* Main headline - staggered */}
                <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.span variants={fadeInUp} className="block text-zinc-100">
                        Your Brand.
                    </motion.span>
                    <motion.span variants={fadeInUp} className="gradient-text block">
                        Personified. 24/7.
                    </motion.span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Create autonomous <strong className="text-white">AI Brand Heroes</strong> that embody your style, voice, and values.
                    Whether an influencer, a model, or a specialist, they live and post on the server — giving you scalable presence without the fatigue.
                </motion.p>

                {/* CTA Buttons - Swapped priority */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <motion.button
                        className="btn-glow px-8 py-4 rounded-full text-white font-semibold flex items-center justify-center gap-2 min-w-[200px]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Create Brand Hero
                    </motion.button>

                    <motion.a
                        href="#roles"
                        className="px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 min-w-[200px]"
                        whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Explore Roles
                    </motion.a>
                </motion.div>

                {/* SYSTEM STATUS - The Anchor */}
                <SystemStatus />
            </div>

            <PhoneMockup />
        </section>
    );
}

// Features section with scroll animations
function HierarchySection() {
    const roles = [
        {
            title: "The Influencer",
            subtitle: "Reach & Relatability",
            description: "Builds para-social relationships with your audience through daily lifestyle content. Perfect for personal brands and consumer apps.",
            color: "teal",
            icon: Users
        },
        {
            title: "The Model",
            subtitle: "Aesthetics & Showcase",
            description: "High-fidelity visual presentation. Focuses on aesthetics, clothing, and environment. Ideal for fashion and luxury goods.",
            color: "emerald",
            icon: Camera
        },
        {
            title: "The Specialist",
            subtitle: "Authority & Utility",
            description: "Demonstrates competence and educates. From AI Electricians to Virtual Secretaries — they provide value through expertise.",
            color: "cyan",
            icon: Brain
        },
    ];

    return (
        <section id="roles" className="py-24 px-6 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        One Hero. <span className="gradient-text">Multiple Roles.</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        The Brand Hero is the identity. The Role is the job.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid md:grid-cols-3 gap-8">
                    {roles.map((role) => (
                        <StaggerItem key={role.title}>
                            <motion.div
                                className={`glass-card rounded-2xl p-8 h-full transition-colors`}
                                whileHover={{
                                    borderColor: `rgba(${role.color === 'teal' ? '20, 184, 166' : role.color === 'emerald' ? '16, 185, 129' : '34, 211, 238'}, 0.3)`,
                                    y: -5
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 
                                    ${role.color === 'teal' ? 'bg-teal-500/20' :
                                        role.color === 'emerald' ? 'bg-emerald-500/20' :
                                            'bg-cyan-500/20'}`}>
                                    <role.icon className={`w-7 h-7 
                                        ${role.color === 'teal' ? 'text-teal-400' :
                                            role.color === 'emerald' ? 'text-emerald-400' :
                                                'text-cyan-400'}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{role.title}</h3>
                                <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-4">{role.subtitle}</p>
                                <p className="text-zinc-400">{role.description}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}

// Gallery section showing example avatar content
function GallerySection() {
    // Julia - Influencer Role
    const influencerExamples = [
        { src: "/examples/workout.png", action: "Morning Routine: Promoting Wellness Brand", time: "07:15:22" },
        { src: "/examples/cafe.png", action: "Location Check-in: Partner Cafe", time: "09:32:04" },
        { src: "/examples/city.png", action: "Lifestyle Content: Urban Living", time: "18:45:11" },
        { src: "/examples/dinner.png", action: "Social Proof: Fine Dining Experience", time: "20:30:00" },
    ];

    // Marcus - Expert/Specialist Role simulation
    const specialistExamples = [
        { src: "/examples/male_gym.png", action: "Authority Building: Technique Demo", time: "06:30:15" },
        { src: "/examples/male_coffee.png", action: "Efficiency: Remote Work Setup", time: "10:15:44" },
        { src: "/examples/male_rooftop.png", action: "Environment: Architecture Analysis", time: "19:00:22" },
        { src: "/examples/male_cooking.png", action: "Skill Showcase: Culinary Precision", time: "20:45:09" },
    ];


    const renderGalleryRow = (examples: typeof influencerExamples, label: string) => (
        <div className="mb-20 last:mb-0">
            <AnimatedSection className="flex items-center gap-4 mb-6">
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-zinc-400 tracking-wide">
                    {label}
                </div>
            </AnimatedSection>

            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {examples.map((example, i) => (
                    <StaggerItem key={i}>
                        <motion.div
                            className="bg-black/20 rounded-xl p-2 border border-white/5 group"
                            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            {/* Image Frame */}
                            <div className="rounded-lg overflow-hidden aspect-[3/4] mb-3 relative">
                                <img
                                    src={example.src}
                                    alt="Agent action"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* System Log below image */}
                            <div className="font-mono text-[10px] text-zinc-500 space-y-1.5 px-1 py-1">
                                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-green-500 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        ACT
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
    );

    return (
        <section id="gallery" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Heroes in <span className="gradient-text">Action</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        See how Brand Heroes perform different roles to achieve business goals.
                    </p>
                </AnimatedSection>

                {renderGalleryRow(influencerExamples, "ACTIVE SIMULATION: ROLE_INFLUENCER (JULIA)")}
                {renderGalleryRow(specialistExamples, "ACTIVE SIMULATION: ROLE_SPECIALIST (MARCUS)")}
            </div>
        </section>
    );
}

// Value Prop Section
function ValueSection() {
    const values = [
        {
            title: "Scalable Presence",
            description: "Your Brand Hero never sleeps. They create content and interact with the world 24/7 without fatigue.",
            icon: Globe,
            color: "teal"
        },
        {
            title: "Controlled Narrative",
            description: "Unlike humans, the AI stays perfectly on-message, protecting your brand safety 100% of the time.",
            icon: Shield,
            color: "emerald"
        },
        {
            title: "Cost-Effective Content",
            description: "Automated generation of visuals and narratives significantly reduces production costs vs. traditional shoots.",
            icon: TrendingUp,
            color: "cyan"
        },
        {
            title: "IP Ownership",
            description: "You own the face of your marketing. No influencer churn, no contract disputes. A permanent asset.",
            icon: FileCheck,
            color: "teal"
        },
    ];

    return (
        <section id="value" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Why Build a <span className="gradient-text">Brand Hero?</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        A strategic asset for the modern digital economy.
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid md:grid-cols-2 gap-8">
                    {values.map((val, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                className="glass-card rounded-2xl p-8 h-full flex flex-row gap-6 items-start group"
                                whileHover={{ borderColor: "rgba(20, 184, 166, 0.3)", y: -5 }}
                            >
                                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center 
                                    ${val.color === 'teal' ? 'bg-teal-500/20' :
                                        val.color === 'emerald' ? 'bg-emerald-500/20' :
                                            'bg-cyan-500/20'}`}>
                                    <val.icon className={`w-6 h-6 
                                        ${val.color === 'teal' ? 'text-teal-400' :
                                            val.color === 'emerald' ? 'text-emerald-400' :
                                                'text-cyan-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">{val.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed">
                                        {val.description}
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

// Tech section
function TechSection() {
    const techs = [
        { icon: Brain, title: "Life Director", subtitle: "Advanced decision-making engine", color: "teal" },
        { icon: Zap, title: "Expression", subtitle: "Multi-modal generation", color: "emerald" },
        { icon: Database, title: "Memory", subtitle: "Context, assets, and state storage", color: "cyan" },
        { icon: Server, title: "24/7 Autonomy", subtitle: "Durable lifecycle execution", color: "teal" },
    ];

    return (
        <section id="technology" className="py-24 px-6 border-t border-zinc-800 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        The Autonomy <span className="gradient-text">Stack</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Orchestrating the heartbeat of digital life
                    </p>
                </AnimatedSection>

                <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {techs.map((tech) => (
                        <StaggerItem key={tech.title}>
                            <motion.div
                                className="glass-card rounded-xl p-6 text-center h-full flex flex-col items-center justify-center"
                                whileHover={{ y: -5, borderColor: `rgba(20, 184, 166, 0.3)` }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <tech.icon className={`w-10 h-10 mx-auto mb-4 
                                        ${tech.color === 'teal' ? 'text-teal-400' :
                                            tech.color === 'emerald' ? 'text-emerald-400' :
                                                'text-cyan-400'}`} />
                                </motion.div>
                                <h4 className="font-semibold mb-2 text-lg">{tech.title}</h4>
                                <p className="text-sm text-zinc-500 leading-snug">{tech.subtitle}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}

// Header with scroll effect
function Header() {
    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/brand-ai-hero" className="flex items-center gap-2">
                    <motion.div
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="font-semibold text-lg">Livra</span>
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {["Roles", "Gallery", "Value", "Technology"].map((item, i) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            whileHover={{ y: -2 }}
                        >
                            {item}
                        </motion.a>
                    ))}
                </nav>

                {/* CTA + Mobile Menu */}
                <div className="flex items-center gap-4">
                    <motion.button
                        className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        Log in
                    </motion.button>
                    <motion.a
                        href="/onboarding"
                        className="hidden sm:block btn-glow px-4 py-2 rounded-full text-sm font-medium text-white"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Create Hero
                    </motion.a>
                    <button className="md:hidden p-2 text-zinc-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.header>
    );
}

// Footer
function Footer() {
    return (
        <AnimatedSection>
            <footer className="py-12 px-6 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Livra</span>
                    </div>
                    <p className="text-sm text-zinc-500">
                        © 2025 Livra. All rights reserved.
                    </p>
                </div>
            </footer>
        </AnimatedSection>
    );
}

// Main animated landing page
export default function BrandHeroLandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <HeroSection />
            <HierarchySection />
            <GallerySection />
            <ValueSection />
            <TechSection />
            <Footer />
        </div>
    );
}
