"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, User, Wallet, ArrowRight, ArrowLeft, Sparkles, Home, Palette, Shirt } from "lucide-react";

// Step data types
interface OnboardingData {
    // Step 1: World
    country: string;
    city: string;
    neighborhood: string;
    apartmentStyle: string;
    // Step 2: Avatar Profile
    name: string;
    type: string;
    gender: string;
    personalityVibe: string;
    // Step 3: Style
    clothingStyle: string;
    bottomwear: string[];
    footwear: string[];
    signatureItems: string[];
    // Step 4: Wealth
    currentBalance: number;
}

const initialData: OnboardingData = {
    country: "",
    city: "",
    neighborhood: "",
    apartmentStyle: "",
    name: "",
    type: "INFLUENCER",
    gender: "female",
    personalityVibe: "",
    clothingStyle: "",
    bottomwear: [],
    footwear: [],
    signatureItems: [],
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

const clothingStyles = [
    { id: "casual", label: "Casual", emoji: "👕" },
    { id: "sporty", label: "Sporty", emoji: "🏃" },
    { id: "elegant", label: "Elegant", emoji: "👔" },
    { id: "streetwear", label: "Streetwear", emoji: "🧢" },
    { id: "bohemian", label: "Bohemian", emoji: "🌻" },
    { id: "minimalist", label: "Minimalist", emoji: "⚪" },
];

// Female bottomwear options
const femaleBottomwearOptions = [
    { id: "jeans", label: "Jeans", emoji: "👖" },
    { id: "skirts", label: "Skirts", emoji: "👗" },
    { id: "shorts", label: "Shorts", emoji: "🩳" },
    { id: "leggings", label: "Leggings", emoji: "🦵" },
    { id: "dresses", label: "Dresses", emoji: "👘" },
    { id: "sweatpants", label: "Sweatpants", emoji: "🏠" },
];

// Male bottomwear options
const maleBottomwearOptions = [
    { id: "jeans", label: "Jeans", emoji: "👖" },
    { id: "chinos", label: "Chinos", emoji: "👔" },
    { id: "shorts", label: "Shorts", emoji: "🩳" },
    { id: "joggers", label: "Joggers", emoji: "🏃" },
    { id: "sweatpants", label: "Sweatpants", emoji: "🏠" },
    { id: "dress-pants", label: "Dress Pants", emoji: "👞" },
];

// Female footwear options
const femaleFootwearOptions = [
    { id: "sneakers", label: "Sneakers", emoji: "👟" },
    { id: "heels", label: "Heels", emoji: "👠" },
    { id: "boots", label: "Boots", emoji: "🥾" },
    { id: "sandals", label: "Sandals", emoji: "🩴" },
    { id: "slippers", label: "Slippers", emoji: "🥿" },
    { id: "barefoot", label: "Often Barefoot", emoji: "🦶" },
];

// Male footwear options
const maleFootwearOptions = [
    { id: "sneakers", label: "Sneakers", emoji: "👟" },
    { id: "dress-shoes", label: "Dress Shoes", emoji: "👞" },
    { id: "boots", label: "Boots", emoji: "🥾" },
    { id: "sandals", label: "Sandals", emoji: "🩴" },
    { id: "slippers", label: "Slippers", emoji: "🥿" },
    { id: "barefoot", label: "Often Barefoot", emoji: "🦶" },
];

// Female signature items
const femaleSignatureItems = [
    { id: "tights", label: "Always wears tights", emoji: "🩱" },
    { id: "oversized-sweaters", label: "Oversized sweaters", emoji: "🧥" },
    { id: "jewelry", label: "Statement jewelry", emoji: "💍" },
    { id: "sunglasses", label: "Sunglasses always", emoji: "🕶️" },
    { id: "hats", label: "Hats & caps", emoji: "🧢" },
    { id: "layered-looks", label: "Layered looks", emoji: "🧣" },
    { id: "crop-tops", label: "Crop tops", emoji: "👙" },
    { id: "maxi-dresses", label: "Maxi dresses", emoji: "👗" },
];

// Male signature items
const maleSignatureItems = [
    { id: "watches", label: "Always wears watch", emoji: "⌚" },
    { id: "oversized-hoodies", label: "Oversized hoodies", emoji: "🧥" },
    { id: "jewelry", label: "Statement jewelry", emoji: "💍" },
    { id: "sunglasses", label: "Sunglasses always", emoji: "🕶️" },
    { id: "hats", label: "Hats & caps", emoji: "🧢" },
    { id: "layered-looks", label: "Layered looks", emoji: "🧣" },
    { id: "leather-jackets", label: "Leather jackets", emoji: "🧥" },
    { id: "ties", label: "Ties & bow ties", emoji: "👔" },
];

const budgetPresets = [
    { amount: 1000, label: "Starter", desc: "Budget lifestyle" },
    { amount: 5000, label: "Comfortable", desc: "Mid-range choices" },
    { amount: 15000, label: "Affluent", desc: "Premium lifestyle" },
];

// Appearance options for Step 5
const hairColors = [
    { id: "blonde", label: "Blonde", color: "#F4D03F" },
    { id: "brunette", label: "Brunette", color: "#8B4513" },
    { id: "black", label: "Black", color: "#1C1C1C" },
    { id: "red", label: "Red", color: "#C0392B" },
    { id: "auburn", label: "Auburn", color: "#A0522D" },
    { id: "gray", label: "Gray/Silver", color: "#A0A0A0" },
];

const hairStyles = [
    { id: "long-straight", label: "Long & Straight", emoji: "💇‍♀️" },
    { id: "long-wavy", label: "Long & Wavy", emoji: "🌊" },
    { id: "long-curly", label: "Long & Curly", emoji: "➰" },
    { id: "medium", label: "Medium Length", emoji: "✂️" },
    { id: "short", label: "Short", emoji: "💈" },
    { id: "pixie", label: "Pixie Cut", emoji: "⭐" },
];

const eyeColors = [
    { id: "brown", label: "Brown", color: "#8B4513" },
    { id: "blue", label: "Blue", color: "#4A90D9" },
    { id: "green", label: "Green", color: "#2E8B57" },
    { id: "hazel", label: "Hazel", color: "#8E7618" },
    { id: "gray", label: "Gray", color: "#708090" },
];

const skinTones = [
    { id: "light", label: "Light", color: "#FFE4C4" },
    { id: "fair", label: "Fair", color: "#FFDAB9" },
    { id: "medium", label: "Medium", color: "#DEB887" },
    { id: "tan", label: "Tan", color: "#CD853F" },
    { id: "olive", label: "Olive", color: "#C4A484" },
    { id: "dark", label: "Dark", color: "#8B4513" },
];

const lipStyles = [
    { id: "natural", label: "Natural", emoji: "👄" },
    { id: "full", label: "Full", emoji: "💋" },
    { id: "thin", label: "Thin", emoji: "〰️" },
];

const featureOptions = [
    { id: "freckles", label: "Freckles", emoji: "🔸" },
    { id: "glasses", label: "Glasses", emoji: "👓" },
    { id: "dimples", label: "Dimples", emoji: "😊" },
    { id: "beauty-mark", label: "Beauty Mark", emoji: "✨" },
    { id: "high-cheekbones", label: "High Cheekbones", emoji: "💎" },
];

const bodyHeights = [
    { id: "petite", label: "Petite", desc: "Under 5'4\" / 160cm", emoji: "🔹" },
    { id: "average", label: "Average", desc: "5'4\" - 5'7\" / 160-170cm", emoji: "➖" },
    { id: "tall", label: "Tall", desc: "Over 5'7\" / 170cm", emoji: "🔷" },
];

const bodyTypes = [
    { id: "slim", label: "Slim", emoji: "🩰" },
    { id: "athletic", label: "Athletic", emoji: "💪" },
    { id: "curvy", label: "Curvy", emoji: "⏳" },
    { id: "plus-size", label: "Plus Size", emoji: "🌸" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const toggleArrayItem = (field: 'bottomwear' | 'footwear' | 'signatureItems', item: string) => {
        setData((prev) => {
            const current = prev[field];
            if (current.includes(item)) {
                return { ...prev, [field]: current.filter((i) => i !== item) };
            } else {
                return { ...prev, [field]: [...current, item] };
            }
        });
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const canProceed = () => {
        if (step === 1) return data.country && data.city && data.apartmentStyle;
        if (step === 2) return data.name && data.type && data.gender && data.personalityVibe;
        if (step === 3) return data.clothingStyle && data.bottomwear.length > 0 && data.footwear.length > 0;
        if (step === 4) return data.currentBalance > 0;
        return false;
    };

    // Get gender-specific options
    const getBottomwearOptions = () => data.gender === "male" ? maleBottomwearOptions : femaleBottomwearOptions;
    const getFootwearOptions = () => data.gender === "male" ? maleFootwearOptions : femaleFootwearOptions;
    const getSignatureItems = () => data.gender === "male" ? maleSignatureItems : femaleSignatureItems;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/persona", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const { id } = await res.json();
                // Redirect to avatar creation instead of persona page
                router.push(`/persona/${id}/avatar`);
            }
        } catch (error) {
            console.error("Failed to create persona:", error);
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">Livra</span>
                    </a>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s === step
                                    ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white"
                                    : s < step
                                        ? "bg-teal-500/20 text-teal-400"
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
                                <MapPin className="w-6 h-6 text-teal-400" />
                                <span className="text-sm text-teal-400 font-medium">Step 1 of 4</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Define the World</h1>
                            <p className="text-zinc-400 mb-8">Where will your avatar live?</p>

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => updateData({ country: e.target.value })}
                                            placeholder="e.g. United States"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-teal-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => updateData({ city: e.target.value })}
                                            placeholder="e.g. Los Angeles"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-teal-500 focus:outline-none transition-colors"
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
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-teal-500 focus:outline-none transition-colors"
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
                                                    ? "border-teal-500 bg-teal-500/10"
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

                    {/* Step 2: Avatar */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-6 h-6 text-emerald-400" />
                                <span className="text-sm text-emerald-400 font-medium">Step 2 of 4</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create the Avatar</h1>
                            <p className="text-zinc-400 mb-8">Who will your AI avatar be?</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => updateData({ name: e.target.value })}
                                        placeholder="e.g. Luna Martinez"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Avatar Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-4">Avatar Type</label>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <button
                                            onClick={() => updateData({ type: "INFLUENCER" })}
                                            className={`p-4 rounded-xl border text-center transition-all ${data.type === "INFLUENCER"
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-2xl mb-2 block">📱</span>
                                            <span className="text-sm font-medium">Influencer</span>
                                        </button>
                                        <button
                                            onClick={() => updateData({ type: "MODEL" })}
                                            className={`p-4 rounded-xl border text-center transition-all ${data.type === "MODEL"
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-2xl mb-2 block">📸</span>
                                            <span className="text-sm font-medium">Model / Modelka</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500 italic text-center">More types coming soon...</p>
                                </div>

                                {/* Gender Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-4">Gender</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => updateData({ gender: "female" })}
                                            className={`p-4 rounded-xl border text-center transition-all ${data.gender === "female"
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-2xl mb-2 block">👩</span>
                                            <span className="text-sm font-medium">Female</span>
                                        </button>
                                        <button
                                            onClick={() => updateData({ gender: "male" })}
                                            className={`p-4 rounded-xl border text-center transition-all ${data.gender === "male"
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-2xl mb-2 block">👨</span>
                                            <span className="text-sm font-medium">Male</span>
                                        </button>
                                    </div>
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
                                                    ? "border-emerald-500 bg-emerald-500/10"
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

                    {/* Step 3: Style */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Shirt className="w-6 h-6 text-cyan-400" />
                                <span className="text-sm text-cyan-400 font-medium">Step 3 of 4</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Define the Style</h1>
                            <p className="text-zinc-400 mb-8">How does your avatar dress?</p>

                            <div className="space-y-8">
                                {/* Clothing Style */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-4">Overall Style</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {clothingStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => updateData({ clothingStyle: style.id })}
                                                className={`p-4 rounded-xl border text-left transition-all ${data.clothingStyle === style.id
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{style.emoji}</span>
                                                <span className="text-sm font-medium">{style.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottomwear */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Preferred Bottomwear <span className="text-zinc-500">(select multiple)</span>
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {getBottomwearOptions().map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleArrayItem('bottomwear', item.id)}
                                                className={`p-3 rounded-xl border text-center transition-all ${data.bottomwear.includes(item.id)
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-xl block">{item.emoji}</span>
                                                <span className="text-xs">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footwear */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Preferred Footwear <span className="text-zinc-500">(select multiple)</span>
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {getFootwearOptions().map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleArrayItem('footwear', item.id)}
                                                className={`p-3 rounded-xl border text-center transition-all ${data.footwear.includes(item.id)
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-xl block">{item.emoji}</span>
                                                <span className="text-xs">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Signature Items */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Signature Elements <span className="text-zinc-500">(optional)</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {getSignatureItems().map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleArrayItem('signatureItems', item.id)}
                                                className={`p-3 rounded-xl border text-center transition-all ${data.signatureItems.includes(item.id)
                                                    ? "border-cyan-500 bg-cyan-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-lg">{item.emoji}</span>
                                                <span className="text-xs block mt-1">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Wealth */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Wallet className="w-6 h-6 text-orange-400" />
                                <span className="text-sm text-orange-400 font-medium">Step 4 of 4</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Set the Wealth</h1>
                            <p className="text-zinc-400 mb-8">How much will they start with? Next: Create their avatar!</p>

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
                                            <span className="text-zinc-400">Apartment</span>
                                            <span>{apartmentStyles.find(s => s.id === data.apartmentStyle)?.label || "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Vibe</span>
                                            <span>{personalityVibes.find(v => v.id === data.personalityVibe)?.label || "—"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Style</span>
                                            <span>{clothingStyles.find(s => s.id === data.clothingStyle)?.label || "—"}</span>
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

                    {step < 4 ? (
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
                                    Save and define Avatar Look
                                </>
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
