"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Mail, User, ArrowRight } from "lucide-react";

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, firstName }),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                console.error("Waitlist error");
                setStatus("idle");
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
            setStatus("idle");
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-teal-500/20 blur-[100px] pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center">

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-teal-400" />
                            </div>

                            {/* Content */}
                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <h3 className="text-2xl font-bold text-white mb-2">You're on the list, {firstName}! 🚀</h3>
                                    <p className="text-zinc-400 mb-6">
                                        We'll notify {email} as soon as a spot opens up.
                                        <br />
                                        Keep an eye on your inbox.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-white mb-2">Early Access Only</h3>
                                    <p className="text-zinc-400 mb-8 leading-relaxed">
                                        We are currently refining the autonomous engine with a closed group of brands. Join the waitlist to secure your spot.
                                    </p>

                                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                                        {/* Name Field */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                                required
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="Enter your work email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === "loading"}
                                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                        >
                                            {status === "loading" ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Join Waitlist
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                                        <span>Limited Spots Available</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
