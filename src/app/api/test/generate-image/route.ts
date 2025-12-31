import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInfluencerImage, saveGeneratedImage } from "@/lib/image-generation";

/**
 * Test endpoint for image generation
 * POST /api/test/generate-image
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { influencerId, prompt } = body;

        if (!influencerId) {
            return NextResponse.json({ error: "influencerId required" }, { status: 400 });
        }

        // Get influencer
        const influencer = await prisma.influencer.findUnique({
            where: { id: influencerId },
        });

        if (!influencer) {
            return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
        }

        // Build prompt
        const imagePrompt = prompt || `A beautiful lifestyle photo of a ${influencer.personalityVibe} influencer in their ${influencer.apartmentStyle} apartment in ${influencer.city}. Authentic Instagram style, natural lighting.`;

        console.log("Generating image with prompt:", imagePrompt);
        console.log("Face references:", influencer.faceReferences.length);
        console.log("Room references:", influencer.roomReferences.length);

        // Generate image
        const result = await generateInfluencerImage(
            imagePrompt,
            influencer.faceReferences,
            influencer.roomReferences,
            {
                aspectRatio: "4:5",
                resolution: "1K", // Use 1K for faster testing
            }
        );

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error,
                prompt: imagePrompt,
            }, { status: 500 });
        }

        // Save to storage
        const imageUrl = await saveGeneratedImage(
            result.imageBase64!,
            result.mimeType!,
            influencerId,
            `test-${Date.now()}`
        );

        return NextResponse.json({
            success: true,
            imageUrl,
            description: result.description,
            prompt: imagePrompt,
            hasBase64: !!result.imageBase64,
        });

    } catch (error) {
        console.error("Test generation error:", error);
        return NextResponse.json({
            error: "Generation failed",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
