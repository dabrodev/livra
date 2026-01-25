import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { getOrCreateUser } from "@/lib/auth";

/**
 * POST /api/persona/[id]/activity/manual
 * Triggers a manual activity with location preference
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getOrCreateUser();
        const { location } = await request.json(); // 'home' | 'outside'

        // Verify ownership
        const persona = await prisma.persona.findUnique({
            where: { id },
            select: { userId: true, isActive: true }
        });

        if (!persona) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        if (persona.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!persona.isActive) {
            return NextResponse.json({ error: "Persona is paused. Activate it first." }, { status: 400 });
        }

        // 1. Cancel any existing schedule/cycle for this persona
        await inngest.send({
            name: 'livra/cycle.stop',
            data: { personaId: id },
        });

        // 2. Wait a tiny bit for the cancellation to propagate (not strictly necessary but safe)
        // Then trigger new cycle with manual flag
        await inngest.send({
            name: 'livra/cycle.start',
            data: {
                personaId: id,
                isManual: true,
                manualLocation: location || 'outside'
            },
        });

        return NextResponse.json({
            success: true,
            message: `Manual activity (${location}) triggered. Overwriting current schedule.`
        });
    } catch (error) {
        console.error("Failed to trigger manual activity:", error);
        return NextResponse.json(
            { error: "Failed to trigger manual activity" },
            { status: 500 }
        );
    }
}
