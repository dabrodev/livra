import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { selectedIndex } = body;

        // For now, we'll save a placeholder URL - later this will be the actual generated image
        // When Nano Banana Pro is integrated, this will save the actual generated avatar URL
        const placeholderUrl = `https://placeholder.avatar/${id}/${selectedIndex}`;

        const influencer = await prisma.influencer.update({
            where: { id },
            data: {
                faceReferences: [placeholderUrl],
            },
        });

        return NextResponse.json({ success: true, id: influencer.id });
    } catch (error) {
        console.error("Failed to save avatar:", error);
        return NextResponse.json(
            { error: "Failed to save avatar" },
            { status: 500 }
        );
    }
}
