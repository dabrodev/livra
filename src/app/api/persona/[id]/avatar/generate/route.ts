import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateImage, saveGeneratedImage } from "@/lib/image-generation";
import { getOrCreateUser } from "@/lib/auth";

/**
 * POST /api/persona/[id]/avatar/generate
 * Generates 3 avatar options based on appearance settings
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require authentication
        const user = await getOrCreateUser();

        const { id } = await params;

        // Get persona with appearance data and verify ownership
        const persona = await prisma.persona.findUnique({
            where: { id },
        });

        if (!persona) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        if (persona.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Build avatar generation prompt from appearance data
        const hairColorLabel = persona.hairColor || "brunette";
        const hairStyleLabel = persona.hairStyle || "long";
        const eyeColorLabel = persona.eyeColor || "brown";
        const skinToneLabel = persona.skinTone || "medium";
        const lipStyleLabel = persona.lipStyle || "natural";
        const bodyHeightLabel = persona.bodyHeight || "average";
        const bodyTypeLabel = persona.bodyType || "slim";
        const features = persona.features as string[] || [];

        const featuresText = features.length > 0
            ? `with ${features.join(", ")}`
            : "";

        // Use gender for appropriate avatar generation
        const genderTerm = persona.gender === 'male' ? 'man' : 'woman';

        // Map clothing style to outfit description
        const clothingStyleMap: Record<string, string> = {
            'casual': 'wearing casual, relaxed clothing (t-shirt, jeans, or comfortable everyday wear)',
            'sporty': 'wearing athletic, sporty attire (activewear, sports clothing)',
            'elegant': 'wearing elegant, sophisticated clothing (dress shirt, blazer, or refined attire)',
            'streetwear': 'wearing trendy streetwear style (urban fashion, modern street style)',
            'bohemian': 'wearing bohemian, free-spirited clothing (flowing, artistic style)',
            'minimalist': 'wearing minimalist, clean-cut clothing (simple, modern basics)',
        };
        const clothingDescription = clothingStyleMap[persona.clothingStyle] || 'wearing casual clothing';

        // Add facial hair description for males
        const facialHairLabel = persona.facialHair || 'none';
        const facialHairText = persona.gender === 'male' && facialHairLabel !== 'none'
            ? `Facial hair: ${facialHairLabel}.`
            : '';

        const basePrompt = `Professional portrait photo of a ${bodyTypeLabel} ${bodyHeightLabel} height ${genderTerm}, ${clothingDescription}. 
Hair: ${hairColorLabel} color, ${hairStyleLabel} style.
${facialHairText}
Eyes: ${eyeColorLabel}.
Skin: ${skinToneLabel} tone.
Lips: ${lipStyleLabel}.
${featuresText}
Style: Clean, modern headshot with soft natural lighting. Professional quality, high resolution.
Background: Simple, blurred, neutral.
Expression: Confident, friendly, approachable.`;

        console.log("Generating avatars for:", persona.name);
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
                            gender: persona.gender || 'female',
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
