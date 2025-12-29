import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface AppearanceData {
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    skinTone: string;
    lipStyle: string;
    features: string[];
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: AppearanceData = await request.json();

        const { hairColor, hairStyle, eyeColor, skinTone, lipStyle, features } = body;

        // Update influencer with appearance data
        const influencer = await prisma.influencer.update({
            where: { id },
            data: {
                hairColor,
                hairStyle,
                eyeColor,
                skinTone,
                lipStyle,
                features: features || [],
            },
        });

        return NextResponse.json({ success: true, id: influencer.id });
    } catch (error) {
        console.error("Failed to save appearance:", error);
        return NextResponse.json(
            { error: "Failed to save appearance" },
            { status: 500 }
        );
    }
}
