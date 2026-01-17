import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateImage, saveGeneratedImage } from "@/lib/image-generation";

/**
 * POST /api/influencer/[id]/avatar/generate
 * Generates 3 avatar options based on appearance settings
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get influencer with appearance data
        const influencer = await prisma.influencer.findUnique({
            where: { id },
        });

        if (!influencer) {
            return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
        }

        // Build avatar generation prompt from appearance data
        const hairColorLabel = influencer.hairColor || "brunette";
        const hairStyleLabel = influencer.hairStyle || "long";
        const eyeColorLabel = influencer.eyeColor || "brown";
        const skinToneLabel = influencer.skinTone || "medium";
        const lipStyleLabel = influencer.lipStyle || "natural";
        const bodyHeightLabel = influencer.bodyHeight || "average";
        const bodyTypeLabel = influencer.bodyType || "slim";
        const features = influencer.features as string[] || [];

        const featuresText = features.length > 0
            ? `with ${features.join(", ")}`
            : "";

        // Use gender for appropriate avatar generation
        const genderTerm = influencer.gender === 'male' ? 'man' : 'woman';

        // Map clothing style to outfit description
        const clothingStyleMap: Record<string, string> = {
            'casual': 'wearing casual, relaxed clothing (t-shirt, jeans, or comfortable everyday wear)',
            'sporty': 'wearing athletic, sporty attire (activewear, sports clothing)',
            'elegant': 'wearing elegant, sophisticated clothing (dress shirt, blazer, or refined attire)',
            'streetwear': 'wearing trendy streetwear style (urban fashion, modern street style)',
            'bohemian': 'wearing bohemian, free-spirited clothing (flowing, artistic style)',
            'minimalist': 'wearing minimalist, clean-cut clothing (simple, modern basics)',
        };
        const clothingDescription = clothingStyleMap[influencer.clothingStyle] || 'wearing casual clothing';

        const basePrompt = `Professional portrait photo of a ${bodyTypeLabel} ${bodyHeightLabel} height ${genderTerm}, ${clothingDescription}. 
Hair: ${hairColorLabel} color, ${hairStyleLabel} style.
Eyes: ${eyeColorLabel}.
Skin: ${skinToneLabel} tone.
Lips: ${lipStyleLabel}.
${featuresText}
Style: Clean, modern headshot with soft natural lighting. Professional quality, high resolution.
Background: Simple, blurred, neutral.
Expression: Confident, friendly, approachable.`;

        console.log("Generating avatars for:", influencer.name);
        console.log("Prompt:", basePrompt);

        // Generate 3 avatar variants (reduced from 6 for efficiency)
        const avatars: { url: string; description?: string }[] = [];
        const errors: string[] = [];

        // 3 variations
        const variations = [
            "Looking directly at camera, warm smile.",
            "Slight head tilt, confident expression.",
            "Three-quarter view, soft smile.",
        ];

        // Generate avatars sequentially (to avoid rate limits)
        for (let i = 0; i < 3; i++) {
            const variantPrompt = `${basePrompt}\n${variations[i]}`;

            try {
                const result = await generateImage(variantPrompt, undefined, {
                    aspectRatio: "1:1",
                    resolution: "1K",
                });

                if (result.success && result.imageBase64) {
                    // Upload to Supabase Storage
                    const imageUrl = await saveGeneratedImage(
                        result.imageBase64,
                        result.mimeType || "image/png",
                        id,
                        `avatar-${i + 1}-${Date.now()}`
                    );

                    const finalUrl = imageUrl || `data:${result.mimeType};base64,${result.imageBase64}`;

                    avatars.push({
                        url: finalUrl,
                        description: result.description,
                    });

                    // Save to AvatarLibrary for future reuse
                    await prisma.avatarLibrary.create({
                        data: {
                            url: finalUrl,
                            gender: influencer.gender || 'female',
                            hairColor: hairColorLabel,
                            hairStyle: hairStyleLabel,
                            eyeColor: eyeColorLabel,
                            skinTone: skinToneLabel,
                            lipStyle: lipStyleLabel,
                            features: features,
                            bodyHeight: bodyHeightLabel,
                            bodyType: bodyTypeLabel,
                            usedBy: [],
                        },
                    });
                } else {
                    errors.push(`Avatar ${i + 1}: ${result.error}`);
                }
            } catch (err) {
                errors.push(`Avatar ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
            }
        }

        if (avatars.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Failed to generate any avatars",
                details: errors,
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            avatars,
            generated: avatars.length,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error("Avatar generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate avatars", details: String(error) },
            { status: 500 }
        );
    }
}
