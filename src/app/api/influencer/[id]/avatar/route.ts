import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { avatarUrl } = body;

        if (!avatarUrl) {
            return NextResponse.json({ error: "avatarUrl required" }, { status: 400 });
        }

        // Save the selected avatar URL to faceReferences
        const influencer = await prisma.influencer.update({
            where: { id },
            data: {
                faceReferences: [avatarUrl],
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

