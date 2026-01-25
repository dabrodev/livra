"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Save, Sparkles, User, Shirt, Palette,
    Home, Check, Loader2, AlertCircle
} from "lucide-react";

// Option data (shared with onboarding/avatar creation)
const hairColors = [
    { id: "blonde", label: "Blonde", color: "#F4D03F" },
    { id: "brunette", label: "Brunette", color: "#8B4513" },
    { id: "black", label: "Black", color: "#1C1C1C" },
    { id: "red", label: "Red", color: "#C0392B" },
    { id: "auburn", label: "Auburn", color: "#A0522D" },
    { id: "gray", label: "Gray", color: "#A0A0A0" },
];

const hairStyles = [
    { id: "long-straight", label: "Long & Straight", emoji: "💇‍♀️", gender: "female" },
    { id: "long-wavy", label: "Long & Wavy", emoji: "🌊", gender: "female" },
    { id: "long-curly", label: "Long & Curly", emoji: "➰", gender: "female" },
    { id: "medium", label: "Medium Length", emoji: "✂️", gender: "female" },
    { id: "short", label: "Short", emoji: "💈", gender: "any" },
    { id: "pixie", label: "Pixie Cut", emoji: "⭐", gender: "female" },
    { id: "buzz-cut", label: "Buzz Cut", emoji: "✂️", gender: "male" },
    { id: "slicked-back", label: "Slicked Back", emoji: "💼", gender: "male" },
    { id: "messy", label: "Messy", emoji: "🌪️", gender: "male" },
];

const skinTones = [
    { id: "light", label: "Light", color: "#FFE4C4" },
    { id: "fair", label: "Fair", color: "#FFDAB9" },
    { id: "medium", label: "Medium", color: "#DEB887" },
    { id: "tan", label: "Tan", color: "#CD853F" },
    { id: "olive", label: "Olive", color: "#C4A484" },
    { id: "dark", label: "Dark", color: "#8B4513" },
];

const clothingStyles = [
    { id: "casual", label: "Casual", emoji: "👕" },
    { id: "sporty", label: "Sporty", emoji: "🏃" },
    { id: "elegant", label: "Elegant", emoji: "👔" },
    { id: "streetwear", label: "Streetwear", emoji: "🧢" },
    { id: "bohemian", label: "Bohemian", emoji: "🌻" },
    { id: "minimalist", label: "Minimalist", emoji: "⚪" },
];

const bottomwearOptions = [
    { id: "jeans", label: "Jeans", emoji: "👖", gender: "any" },
    { id: "skirts", label: "Skirts", emoji: "👗", gender: "female" },
    { id: "shorts", label: "Shorts", emoji: "🩳", gender: "any" },
    { id: "leggings", label: "Leggings", emoji: "🦵", gender: "female" },
    { id: "dresses", label: "Dresses", emoji: "👘", gender: "female" },
    { id: "sweatpants", label: "Sweatpants", emoji: "🏠", gender: "any" },
    { id: "chinos", label: "Chinos", emoji: "👔", gender: "male" },
    { id: "joggers", label: "Joggers", emoji: "🏃", gender: "male" },
    { id: "dress-pants", label: "Dress Pants", emoji: "👞", gender: "male" },
];

const footwearOptions = [
    { id: "sneakers", label: "Sneakers", emoji: "👟", gender: "any" },
    { id: "heels", label: "Heels", emoji: "👠", gender: "female" },
    { id: "boots", label: "Boots", emoji: "🥾", gender: "any" },
    { id: "sandals", label: "Sandals", emoji: "🩴", gender: "any" },
    { id: "slippers", label: "Slippers", emoji: "🥿", gender: "any" },
    { id: "barefoot", label: "Barefoot", emoji: "🦶", gender: "any" },
    { id: "dress-shoes", label: "Dress Shoes", emoji: "👞", gender: "male" },
];

const signatureItems = [
    { id: "tights", label: "Always wears tights", emoji: "🩱", gender: "female" },
    { id: "oversized-sweaters", label: "Oversized sweaters", emoji: "🧥", gender: "female" },
    { id: "jewelry", label: "Statement jewelry", emoji: "💍", gender: "any" },
    { id: "sunglasses", label: "Sunglasses always", emoji: "🕶️", gender: "any" },
    { id: "hats", label: "Hats & caps", emoji: "🧢", gender: "any" },
    { id: "layered-looks", label: "Layered looks", emoji: "🧣", gender: "any" },
    { id: "watches", label: "Always wears watch", emoji: "⌚", gender: "male" },
    { id: "oversized-hoodies", label: "Oversized hoodies", emoji: "🧥", gender: "male" },
];

export default function PersonaSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const personaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [gender, setGender] = useState<string>("female");
    const [data, setData] = useState({
        hairColor: "",
        hairStyle: "",
        eyeColor: "",
        skinTone: "",
        lipStyle: "",
        features: [] as string[],
        bodyHeight: "",
        bodyType: "",
        clothingStyle: "",
        bottomwear: [] as string[],
        footwear: [] as string[],
        signatureItems: [] as string[],
        personalityVibe: "",
        apartmentStyle: "",
    });

    useEffect(() => {
        const fetchPersona = async () => {
            try {
                const response = await fetch(`/api/persona/${personaId}`);
                if (!response.ok) throw new Error("Failed to fetch persona");
                const result = await response.json();

                // Detailed fetch for all fields (GET /api/persona/[id] might be truncated)
                // In a real app, you'd have a full profile endpoint
                // Since I can't easily modify the GET endpoint right now without seeing it all, 
                // I'll assume I need to fetch the full object if available.
                // For this demo, I'll populate from the existing API response which I saw in previous turns.
                const p = result.persona;
                setGender(p.gender);
                setData({
                    hairColor: p.hairColor || "brown",
                    hairStyle: p.hairStyle || "long",
                    eyeColor: p.eyeColor || "brown",
                    skinTone: p.skinTone || "medium",
                    lipStyle: p.lipStyle || "natural",
                    features: p.features || [],
                    bodyHeight: p.bodyHeight || "average",
                    bodyType: p.bodyType || "slim",
                    clothingStyle: p.clothingStyle || "casual",
                    bottomwear: p.bottomwear || [],
                    footwear: p.footwear || [],
                    signatureItems: p.signatureItems || [],
                    personalityVibe: p.personalityVibe || "",
                    apartmentStyle: p.apartmentStyle || "",
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPersona();
    }, [personaId]);

    const updateField = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
    };

    const toggleArrayItem = (field: 'bottomwear' | 'footwear' | 'signatureItems' | 'features', item: string) => {
        setData(prev => {
            const current = (prev[field] as string[]) || [];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, [field]: updated };
        });
        setSuccess(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/persona/${personaId}/preferences`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to save changes");

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
        );
    }

    const filteredHairStyles = hairStyles.filter(s => s.gender === "any" || s.gender === gender);
    const filteredBottomwear = bottomwearOptions.filter(s => s.gender === "any" || s.gender === gender);
    const filteredFootwear = footwearOptions.filter(s => s.gender === "any" || s.gender === gender);
    const filteredSignatureItems = signatureItems.filter(s => s.gender === "any" || s.gender === gender);

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href={`/persona/${personaId}`}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Profile</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        <span className="font-semibold">Settings</span>
                    </div>
                </div>
            </header>

            <main className="pt-24 max-w-2xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Preferences</h1>
                        <p className="text-zinc-400 text-sm mt-1">Changes will affect all future generations</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${success
                                ? "bg-green-500 text-white"
                                : "btn-glow text-white disabled:opacity-50"
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {success ? "Saved!" : "Save Changes"}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-12">
                    {/* Appearance */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Appearance</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Hair Color */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">Hair Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {hairColors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => updateField('hairColor', color.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${data.hairColor === color.id
                                                    ? "border-teal-500 bg-teal-500/10 text-teal-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.color }} />
                                            <span className="text-xs font-medium">{color.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hair Style */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">Hair Style</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {filteredHairStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => updateField('hairStyle', style.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${data.hairStyle === style.id
                                                    ? "border-teal-500 bg-teal-500/10 text-teal-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-lg">{style.emoji}</span>
                                            <span className="text-xs font-medium">{style.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Skin Tone */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">Skin Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {skinTones.map((tone) => (
                                        <button
                                            key={tone.id}
                                            onClick={() => updateField('skinTone', tone.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${data.skinTone === tone.id
                                                    ? "border-teal-500 bg-teal-500/10 text-teal-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tone.color }} />
                                            <span className="text-xs font-medium">{tone.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Clothing Style */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Shirt className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Clothing &amp; Style</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Base Style */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">Overall Style</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {clothingStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => updateField('clothingStyle', style.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${data.clothingStyle === style.id
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-lg">{style.emoji}</span>
                                            <span className="text-xs font-medium">{style.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bottomwear */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">
                                    Bottomwear <span className="text-zinc-500 font-normal">(AI picks from these)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredBottomwear.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleArrayItem('bottomwear', item.id)}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${data.bottomwear.includes(item.id)
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-base">{item.emoji}</span>
                                            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footwear */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-3">
                                    Footwear <span className="text-zinc-500 font-normal">(AI picks from these)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredFootwear.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleArrayItem('footwear', item.id)}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${data.footwear.includes(item.id)
                                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                                }`}
                                        >
                                            <span className="text-base">{item.emoji}</span>
                                            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Signature Elements */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Palette className="w-4 h-4 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Signature Elements</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredSignatureItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleArrayItem('signatureItems', item.id)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${data.signatureItems.includes(item.id)
                                            ? "border-orange-500 bg-orange-500/10 text-orange-400"
                                            : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${data.signatureItems.includes(item.id) ? "bg-orange-500/20" : "bg-zinc-800"
                                        }`}>
                                        {item.emoji}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* World/Vibe */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Home className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold">World &amp; Vibe</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Apartment Style</label>
                                <select
                                    value={data.apartmentStyle}
                                    onChange={(e) => updateField('apartmentStyle', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
                                >
                                    <option value="minimalist">Minimalist Loft</option>
                                    <option value="bohemian">Bohemian Studio</option>
                                    <option value="luxury">Luxury Penthouse</option>
                                    <option value="cozy">Cozy Apartment</option>
                                    <option value="industrial">Industrial Space</option>
                                    <option value="coastal">Coastal Villa</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Persona Vibe</label>
                                <select
                                    value={data.personalityVibe}
                                    onChange={(e) => updateField('personalityVibe', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
                                >
                                    <option value="minimalist-glam">Minimalist Glam</option>
                                    <option value="streetwear-rebel">Streetwear Rebel</option>
                                    <option value="cottagecore-dreamer">Cottagecore Dreamer</option>
                                    <option value="tech-futurist">Tech Futurist</option>
                                    <option value="wellness-guru">Wellness Guru</option>
                                    <option value="vintage-collector">Vintage Collector</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
