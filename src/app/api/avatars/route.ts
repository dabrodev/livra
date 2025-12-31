import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/avatars - Get all avatars from the library
 * Optional query params for filtering by appearance
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Build filter from query params
        const where: Record<string, string | undefined> = {};

        if (searchParams.get("hairColor")) where.hairColor = searchParams.get("hairColor")!;
        if (searchParams.get("hairStyle")) where.hairStyle = searchParams.get("hairStyle")!;
        if (searchParams.get("eyeColor")) where.eyeColor = searchParams.get("eyeColor")!;
        if (searchParams.get("skinTone")) where.skinTone = searchParams.get("skinTone")!;
        if (searchParams.get("bodyType")) where.bodyType = searchParams.get("bodyType")!;

        const avatars = await prisma.avatarLibrary.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
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
        return NextResponse.json(
            { error: "Failed to fetch avatars" },
            { status: 500 }
        );
    }
}
