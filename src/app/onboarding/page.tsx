"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, User, Wallet, ArrowRight, ArrowLeft, Sparkles, Home, Palette } from "lucide-react";

// Step data types
interface OnboardingData {
    // Step 1: World
    country: string;
    city: string;
    neighborhood: string;
    apartmentStyle: string;
    // Step 2: Persona
    name: string;
    personalityVibe: string;
    // Step 3: Wealth
    currentBalance: number;
}

const initialData: OnboardingData = {
    country: "",
    city: "",
    neighborhood: "",
    apartmentStyle: "",
    name: "",
    personalityVibe: "",
    currentBalance: 5000,
};

const apartmentStyles = [
    { id: "minimalist", label: "Minimalist Loft", icon: "🏢" },
    { id: "bohemian", label: "Bohemian Studio", icon: "🎨" },
    { id: "luxury", label: "Luxury Penthouse", icon: "✨" },
    { id: "cozy", label: "Cozy Apartment", icon: "🏠" },
    { id: "industrial", label: "Industrial Space", icon: "🏭" },
    { id: "coastal", label: "Coastal Villa", icon: "🌊" },
];

const personalityVibes = [
    { id: "minimalist-glam", label: "Minimalist Glam", emoji: "💎" },
    { id: "streetwear-rebel", label: "Streetwear Rebel", emoji: "🔥" },
    { id: "cottagecore-dreamer", label: "Cottagecore Dreamer", emoji: "🌸" },
    { id: "tech-futurist", label: "Tech Futurist", emoji: "🤖" },
    { id: "wellness-guru", label: "Wellness Guru", emoji: "🧘" },
    { id: "vintage-collector", label: "Vintage Collector", emoji: "📷" },
];

const budgetPresets = [
    { amount: 1000, label: "Starter", desc: "Budget lifestyle" },
    { amount: 5000, label: "Comfortable", desc: "Mid-range choices" },
    { amount: 15000, label: "Affluent", desc: "Premium experiences" },
    { amount: 50000, label: "Luxury", desc: "No limits" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const canProceed = () => {
        if (step === 1) return data.country && data.city && data.apartmentStyle;
        if (step === 2) return data.name && data.personalityVibe;
        if (step === 3) return data.currentBalance > 0;
        return false;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/influencer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const { id } = await res.json();
                router.push(`/influencer/${id}`);
            }
        } catch (error) {
            console.error("Failed to create influencer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">daywith.me</span>
                    </a>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s === step
                                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                    : s < step
                                        ? "bg-purple-500/20 text-purple-400"
                                        : "bg-zinc-800 text-zinc-500"
                                    }`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-32 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Step 1: World */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="w-6 h-6 text-purple-400" />
                                <span className="text-sm text-purple-400 font-medium">Step 1 of 3</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Define the World</h1>
                            <p className="text-zinc-400 mb-8">Where will your influencer live?</p>

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => updateData({ country: e.target.value })}
                                            placeholder="e.g. United States"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => updateData({ city: e.target.value })}
                                            placeholder="e.g. Los Angeles"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Neighborhood (optional)</label>
                                    <input
                                        type="text"
                                        value={data.neighborhood}
                                        onChange={(e) => updateData({ neighborhood: e.target.value })}
                                        placeholder="e.g. Silver Lake"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-4">
                                        <Home className="w-4 h-4 inline mr-2" />
                                        Apartment Style
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {apartmentStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => updateData({ apartmentStyle: style.id })}
                                                className={`p-4 rounded-xl border text-left transition-all ${data.apartmentStyle === style.id
                                                    ? "border-purple-500 bg-purple-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{style.icon}</span>
                                                <span className="text-sm font-medium">{style.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Persona */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-6 h-6 text-pink-400" />
                                <span className="text-sm text-pink-400 font-medium">Step 2 of 3</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create the Persona</h1>
                            <p className="text-zinc-400 mb-8">Who will your influencer be?</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => updateData({ name: e.target.value })}
                                        placeholder="e.g. Luna Martinez"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-pink-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-4">
                                        <Palette className="w-4 h-4 inline mr-2" />
                                        Personality Vibe
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {personalityVibes.map((vibe) => (
                                            <button
                                                key={vibe.id}
                                                onClick={() => updateData({ personalityVibe: vibe.id })}
                                                className={`p-4 rounded-xl border text-left transition-all ${data.personalityVibe === vibe.id
                                                    ? "border-pink-500 bg-pink-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{vibe.emoji}</span>
                                                <span className="text-sm font-medium">{vibe.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Wealth */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Wallet className="w-6 h-6 text-orange-400" />
                                <span className="text-sm text-orange-400 font-medium">Step 3 of 3</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Set the Wealth</h1>
                            <p className="text-zinc-400 mb-8">How much will they start with?</p>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {budgetPresets.map((preset) => (
                                        <button
                                            key={preset.amount}
                                            onClick={() => updateData({ currentBalance: preset.amount })}
                                            className={`p-4 rounded-xl border text-center transition-all ${data.currentBalance === preset.amount
                                                ? "border-orange-500 bg-orange-500/10"
                                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-2xl font-bold gradient-text block">
                                                ${preset.amount.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-medium text-zinc-300">{preset.label}</span>
                                            <span className="text-xs text-zinc-500 block">{preset.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Or enter custom amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                        <input
                                            type="number"
                                            value={data.currentBalance}
                                            onChange={(e) => updateData({ currentBalance: Number(e.target.value) })}
                                            min={100}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="glass-card rounded-2xl p-6 mt-8">
                                    <h3 className="font-semibold mb-4">Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Name</span>
                                            <span>{data.name || "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Location</span>
                                            <span>{data.city ? `${data.city}, ${data.country}` : "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Style</span>
                                            <span>{apartmentStyles.find(s => s.id === data.apartmentStyle)?.label || "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Vibe</span>
                                            <span>{personalityVibes.find(v => v.id === data.personalityVibe)?.label || "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Balance</span>
                                            <span className="gradient-text font-semibold">${data.currentBalance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer navigation */}
            <footer className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/5 p-4">
                <div className="max-w-2xl mx-auto flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${step === 1
                            ? "opacity-0 pointer-events-none"
                            : "text-zinc-300 hover:text-white"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${canProceed()
                                ? "btn-glow text-white"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                }`}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isSubmitting}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${canProceed() && !isSubmitting
                                ? "btn-glow text-white"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                }`}
                        >
                            {isSubmitting ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Create Influencer
                                </>
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
