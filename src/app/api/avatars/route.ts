import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/avatars - Get all avatars from the library
 * Optional query params for filtering by appearance
 */
import { getOrCreateUser } from "@/lib/auth";

/**
 * GET /api/avatars - Get user's avatar library
 * Optional query params for filtering by appearance
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const user = await getOrCreateUser();

        const { searchParams } = new URL(request.url);

        // Build filter from query params
        const where: any = {
            userId: user.id // enforce ownership filtering
        };

        if (searchParams.get("hairColor")) where.hairColor = searchParams.get("hairColor")!;
        if (searchParams.get("hairStyle")) where.hairStyle = searchParams.get("hairStyle")!;
        if (searchParams.get("eyeColor")) where.eyeColor = searchParams.get("eyeColor")!;
        if (searchParams.get("skinTone")) where.skinTone = searchParams.get("skinTone")!;
        if (searchParams.get("bodyType")) where.bodyType = searchParams.get("bodyType")!;

        const avatars = await prisma.avatarLibrary.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 50, // Limit results
        });

        return NextResponse.json({
            success: true,
            avatars,
            count: avatars.length,
        });
    } catch (error) {
        console.error("Failed to fetch avatars:", error);

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json(
            { error: "Failed to fetch avatars" },
            { status: 500 }
        );
    }
}
