import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

interface AppearanceData {
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    skinTone: string;
    lipStyle: string;
    features: string[];
    bodyHeight: string;
    bodyType: string;
}

export async function POST(
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

        const body: AppearanceData = await request.json();

        const { hairColor, hairStyle, eyeColor, skinTone, lipStyle, features, bodyHeight, bodyType } = body;

        // Update persona with appearance data
        const persona = await prisma.persona.update({
            where: { id },
            data: {
                hairColor,
                hairStyle,
                eyeColor,
                skinTone,
                lipStyle,
                features: features || [],
                bodyHeight,
                bodyType,
            },
        });

        return NextResponse.json({ success: true, id: persona.id });
    } catch (error) {
        console.error("Failed to save appearance:", error);
        return NextResponse.json(
            { error: "Failed to save appearance" },
            { status: 500 }
        );
    }
}
