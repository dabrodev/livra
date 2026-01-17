import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/influencer/[id]
 * Returns influencer data including gender
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const influencer = await prisma.influencer.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                gender: true,
                country: true,
                city: true,
                clothingStyle: true,
                personalityVibe: true,
            },
        });

        if (!influencer) {
            return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
        }

        return NextResponse.json(influencer);
    } catch (error) {
        console.error("Failed to fetch influencer:", error);
        return NextResponse.json(
            { error: "Failed to fetch influencer" },
            { status: 500 }
        );
    }
}
