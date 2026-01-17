import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Require authentication
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
        const { avatarUrl } = body;

        if (!avatarUrl) {
            return NextResponse.json({ error: "avatarUrl required" }, { status: 400 });
        }

        // Save the selected avatar URL to faceReferences
        const persona = await prisma.persona.update({
            where: { id },
            data: {
                faceReferences: [avatarUrl],
            },
        });

        return NextResponse.json({ success: true, id: persona.id });
    } catch (error) {
        console.error("Failed to save avatar:", error);
        return NextResponse.json(
            { error: "Failed to save avatar" },
            { status: 500 }
        );
    }
}

