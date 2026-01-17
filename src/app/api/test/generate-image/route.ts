import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePersonaImage, saveGeneratedImage } from "@/lib/image-generation";

/**
 * Test endpoint for image generation
 * POST /api/test/generate-image
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { personaId, prompt } = body;

        if (!personaId) {
            return NextResponse.json({ error: "personaId required" }, { status: 400 });
        }

        // Get persona
        const persona = await prisma.persona.findUnique({
            where: { id: personaId },
        });

        if (!persona) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        // Build prompt
        const imagePrompt = prompt || `A beautiful lifestyle photo of a ${persona.personalityVibe} persona in their ${persona.apartmentStyle} apartment in ${persona.city}. Authentic Instagram style, natural lighting.`;

        console.log("Generating image with prompt:", imagePrompt);
        console.log("Face references:", persona.faceReferences.length);
        console.log("Room references:", persona.roomReferences.length);

        // Generate image
        const result = await generatePersonaImage(
            imagePrompt,
            persona.faceReferences,
            persona.roomReferences,
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
            personaId,
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
