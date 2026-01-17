import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

/**
 * GET /api/persona/[id]
 * Returns persona data including gender
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require authentication
        const user = await getOrCreateUser();
        const { id } = await params;

        const persona = await prisma.persona.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                gender: true,
                country: true,
                city: true,
                clothingStyle: true,
                personalityVibe: true,
                userId: true, // Include userId to verify ownership
            },
        });

        if (!persona) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        // Verify ownership
        if (persona.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Remove userId from response
        const { userId, ...personaData } = persona;

        return NextResponse.json(personaData);
    } catch (error) {
        console.error("Failed to fetch persona:", error);

        // Check if it's an auth error
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch persona" },
            { status: 500 }
        );
    }
}
