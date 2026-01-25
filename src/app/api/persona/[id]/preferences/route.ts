import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getOrCreateUser();

        // Verify ownership
        const existingPersona = await prisma.persona.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existingPersona) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        if (existingPersona.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();

        // Update persona with provided fields
        const persona = await prisma.persona.update({
            where: { id },
            data: {
                // Appearance
                hairColor: body.hairColor,
                hairStyle: body.hairStyle,
                eyeColor: body.eyeColor,
                skinTone: body.skinTone,
                lipStyle: body.lipStyle,
                features: body.features,
                bodyHeight: body.bodyHeight,
                bodyType: body.bodyType,
                // Style
                clothingStyle: body.clothingStyle,
                bottomwear: body.bottomwear,
                footwear: body.footwear,
                signatureItems: body.signatureItems,
                // Personality/Vibe
                personalityVibe: body.personalityVibe,
                apartmentStyle: body.apartmentStyle,
            },
        });

        return NextResponse.json({ success: true, id: persona.id });
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return NextResponse.json(
            { error: "Failed to update preferences" },
            { status: 500 }
        );
    }
}
