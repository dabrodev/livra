"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Wand2, Check, RefreshCw, AlertCircle, Library } from "lucide-react";

// Appearance options
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

// Gender-specific hair styles
const femaleHairStyles = hairStyles;
const maleHairStyles = [
    { id: "short", label: "Short", emoji: "💈" },
    { id: "buzz-cut", label: "Buzz Cut", emoji: "✂️" },
    { id: "crew-cut", label: "Crew Cut", emoji: "👨" },
    { id: "slicked-back", label: "Slicked Back", emoji: "💼" },
    { id: "messy", label: "Messy", emoji: "🌪️" },
    { id: "bald", label: "Bald", emoji: "🥚" },
];

// Facial hair options (for males)
const facialHairOptions = [
    { id: "none", label: "Clean Shaven", emoji: "😊" },
    { id: "stubble", label: "Stubble", emoji: "🧔" },
    { id: "beard", label: "Full Beard", emoji: "🧔‍♂️" },
    { id: "goatee", label: "Goatee", emoji: "🎭" },
    { id: "mustache", label: "Mustache", emoji: "🥸" },
];

// Gender-specific body types
const femaleBodyTypes = bodyTypes;
const maleBodyTypes = [
    { id: "slim", label: "Slim", emoji: "🏃" },
    { id: "athletic", label: "Athletic", emoji: "💪" },
    { id: "muscular", label: "Muscular", emoji: "🏋️" },
    { id: "stocky", label: "Stocky", emoji: "🐻" },
];


interface AvatarData {
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    skinTone: string;
    lipStyle: string;
    facialHair: string;
    features: string[];
    bodyHeight: string;
    bodyType: string;
}

interface GeneratedAvatar {
    url: string;
    description?: string;
}

interface LibraryAvatar {
    id: string;
    url: string;
    hairColor?: string;
    skinTone?: string;
}

export default function AvatarCreationPage() {
    const router = useRouter();
    const params = useParams();
    const influencerId = params.id as string;

    const [data, setData] = useState<AvatarData>({
        hairColor: "",
        hairStyle: "",
        eyeColor: "",
        skinTone: "",
        lipStyle: "",
        facialHair: "none",
        features: [],
        bodyHeight: "",
        bodyType: "",
    });
    const [influencerGender, setInfluencerGender] = useState<string>("female");
    const [step, setStep] = useState<"configure" | "generating" | "select" | "library">("configure");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAvatars, setGeneratedAvatars] = useState<GeneratedAvatar[]>([]);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [libraryAvatars, setLibraryAvatars] = useState<LibraryAvatar[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    // Fetch influencer gender and library avatars on mount
    useEffect(() => {
        fetchInfluencerGender();
        fetchLibraryAvatars();
    }, [influencerId]);

    const fetchInfluencerGender = async () => {
        try {
            const response = await fetch(`/api/influencer/${influencerId}`);
            if (response.ok) {
                const influencer = await response.json();
                setInfluencerGender(influencer.gender || "female");
            }
        } catch (error) {
            console.error("Failed to fetch influencer gender:", error);
        }
    };

    const fetchLibraryAvatars = async () => {
        setIsLoadingLibrary(true);
        try {
            const response = await fetch("/api/avatars");
            const result = await response.json();
            if (result.success) {
                setLibraryAvatars(result.avatars);
            }
        } catch (error) {
            console.error("Failed to fetch library:", error);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    const updateData = (updates: Partial<AvatarData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const toggleFeature = (feature: string) => {
        setData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const canGenerate = data.hairColor && data.hairStyle && data.eyeColor && data.skinTone && data.lipStyle && data.bodyHeight && data.bodyType;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationError(null);
        setStep("generating");
        setGenerationProgress(0);

        try {
            // Save appearance data to influencer first
            await fetch(`/api/influencer/${influencerId}/appearance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            // Start progress animation
            const progressInterval = setInterval(() => {
                setGenerationProgress((prev) => Math.min(prev + 2, 90));
            }, 500);

            // Generate avatars with AI
            const response = await fetch(`/api/influencer/${influencerId}/avatar/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            clearInterval(progressInterval);
            setGenerationProgress(100);

            const result = await response.json();

            if (result.success && result.avatars?.length > 0) {
                setGeneratedAvatars(result.avatars);
                setStep("select");
            } else {
                setGenerationError(result.error || "Failed to generate avatars");
                setStep("configure");
            }
        } catch (error) {
            console.error("Failed to generate avatars:", error);
            setGenerationError("Failed to connect to AI service");
            setStep("configure");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectAvatar = async (avatarIndex: number) => {
        const selectedAvatar = generatedAvatars[avatarIndex];
        if (!selectedAvatar) return;

        try {
            // Save selected avatar URL to faceReferences
            await fetch(`/api/influencer/${influencerId}/avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedIndex: avatarIndex,
                    avatarUrl: selectedAvatar.url,
                }),
            });

            router.push(`/influencer/${influencerId}`);
        } catch (error) {
            console.error("Failed to save avatar:", error);
        }
    };

    const handleSelectFromLibrary = async (avatar: LibraryAvatar) => {
        try {
            await fetch(`/api/influencer/${influencerId}/avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    avatarUrl: avatar.url,
                }),
            });

            router.push(`/influencer/${influencerId}`);
        } catch (error) {
            console.error("Failed to save avatar:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href={`/influencer/${influencerId}`}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Timeline</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold">Livra</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Configure Step */}
                    {step === "configure" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Wand2 className="w-6 h-6 text-teal-400" />
                                <span className="text-sm text-teal-400 font-medium">Avatar Creation</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Define Appearance</h1>
                            <p className="text-zinc-400 mb-8">Customize your influencer&apos;s look</p>

                            <div className="space-y-8">
                                {/* Hair Color */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Hair Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {hairColors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => updateData({ hairColor: color.id })}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${data.hairColor === color.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: color.color }}
                                                />
                                                <span className="text-sm">{color.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hair Style */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Hair Style</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {(influencerGender === "male" ? maleHairStyles : femaleHairStyles).map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => updateData({ hairStyle: style.id })}
                                                className={`p-3 rounded-xl border text-left transition-all ${data.hairStyle === style.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-xl">{style.emoji}</span>
                                                <span className="text-sm block mt-1">{style.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Eye Color */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Eye Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {eyeColors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => updateData({ eyeColor: color.id })}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${data.eyeColor === color.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: color.color }}
                                                />
                                                <span className="text-sm">{color.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skin Tone */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Skin Tone</label>
                                    <div className="flex flex-wrap gap-3">
                                        {skinTones.map((tone) => (
                                            <button
                                                key={tone.id}
                                                onClick={() => updateData({ skinTone: tone.id })}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${data.skinTone === tone.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: tone.color }}
                                                />
                                                <span className="text-sm">{tone.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Lip Style */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Lip Style</label>
                                    <div className="flex gap-3">
                                        {lipStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => updateData({ lipStyle: style.id })}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${data.lipStyle === style.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-xl">{style.emoji}</span>
                                                <span className="text-sm">{style.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Facial Hair (Males only) */}
                                {influencerGender === "male" && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-3">Facial Hair</label>
                                        <div className="flex flex-wrap gap-3">
                                            {facialHairOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => updateData({ facialHair: option.id })}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${data.facialHair === option.id
                                                        ? "border-teal-500 bg-teal-500/10"
                                                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                        }`}
                                                >
                                                    <span className="text-xl">{option.emoji}</span>
                                                    <span className="text-sm">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                                        Special Features <span className="text-zinc-500">(optional)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {featureOptions.map((feature) => (
                                            <button
                                                key={feature.id}
                                                onClick={() => toggleFeature(feature.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${data.features.includes(feature.id)
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span>{feature.emoji}</span>
                                                <span className="text-sm">{feature.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Body Height */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Body Height</label>
                                    <div className="flex gap-3">
                                        {bodyHeights.map((height) => (
                                            <button
                                                key={height.id}
                                                onClick={() => updateData({ bodyHeight: height.id })}
                                                className={`flex-1 p-4 rounded-xl border text-center transition-all ${data.bodyHeight === height.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-xl block">{height.emoji}</span>
                                                <span className="text-sm font-medium block mt-1">{height.label}</span>
                                                <span className="text-xs text-zinc-500 block">{height.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Body Type */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-3">Body Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(influencerGender === "male" ? maleBodyTypes : femaleBodyTypes).map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => updateData({ bodyType: type.id })}
                                                className={`p-4 rounded-xl border text-center transition-all ${data.bodyType === type.id
                                                    ? "border-teal-500 bg-teal-500/10"
                                                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-2xl block">{type.emoji}</span>
                                                <span className="text-sm font-medium block mt-1">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error display */}
                                {generationError && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-red-400 font-medium">Generation failed</p>
                                            <p className="text-red-400/70 text-sm">{generationError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                    className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${canGenerate
                                        ? "btn-glow text-white"
                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        }`}
                                >
                                    <Wand2 className="w-5 h-5" />
                                    Generate Options
                                </button>

                                {/* Browse Library Button */}
                                {libraryAvatars.length > 0 && (
                                    <button
                                        onClick={() => setStep("library")}
                                        className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                                    >
                                        <Library className="w-5 h-5" />
                                        Browse Library ({libraryAvatars.length} avatars)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Generating Step */}
                    {step === "generating" && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center animate-pulse">
                                <Wand2 className="w-12 h-12 text-white animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Generating Avatars...</h2>
                            <p className="text-zinc-400 mb-6">AI is creating 3 unique avatar options for you</p>

                            {/* Progress bar */}
                            <div className="w-64 mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                                    style={{ width: `${generationProgress}%` }}
                                />
                            </div>
                            <p className="text-zinc-500 text-sm mt-2">{generationProgress}%</p>
                        </div>
                    )}

                    {/* Select Step */}
                    {step === "select" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h1 className="text-3xl font-bold mb-2 text-center">Choose Your Avatar</h1>
                            <p className="text-zinc-400 mb-8 text-center">Select the one that best represents your influencer</p>

                            {/* Avatar Grid - Real generated avatars */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {generatedAvatars.map((avatar, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAvatar(index)}
                                        className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 transition-all group overflow-hidden relative"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={avatar.url}
                                            alt={`Avatar option ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/20 transition-colors flex items-center justify-center">
                                            <Check className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Regenerate Button */}
                            <button
                                onClick={() => setStep("configure")}
                                className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Adjust Appearance &amp; Regenerate
                            </button>
                        </div>
                    )}

                    {/* Library Step */}
                    {step === "library" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <Library className="w-6 h-6 text-teal-400" />
                                <span className="text-sm text-teal-400 font-medium">Avatar Library</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Choose from Library</h1>
                            <p className="text-zinc-400 mb-8">Select a previously generated avatar</p>

                            {isLoadingLibrary ? (
                                <div className="text-center py-12">
                                    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-zinc-400">Loading library...</p>
                                </div>
                            ) : libraryAvatars.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-zinc-400">No avatars in library yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                                    {libraryAvatars.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => handleSelectFromLibrary(avatar)}
                                            className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 transition-all group overflow-hidden relative"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={avatar.url}
                                                alt="Library avatar"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/20 transition-colors flex items-center justify-center">
                                                <Check className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Back Button */}
                            <button
                                onClick={() => setStep("configure")}
                                className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Configuration
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
