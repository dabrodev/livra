import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { active } = await req.json();

    try {
        // Get current influencer state
        const current = await prisma.influencer.findUnique({
            where: { id },
            select: { lifecycleStartedAt: true }
        });

        const isFirstStart = active && !current?.lifecycleStartedAt;

        // Update influencer status
        const influencer = await prisma.influencer.update({
            where: { id },
            data: {
                isActive: active,
                // Set lifecycleStartedAt only on first start
                ...(isFirstStart && { lifecycleStartedAt: new Date() })
            } as any,
        });

        // Only send event on FIRST start, not on resume
        if (isFirstStart) {
            await inngest.send({
                name: 'livra/cycle.start',
                data: { influencerId: id },
            });
        }

        return NextResponse.json({
            success: true,
            active: (influencer as any).isActive,
            isFirstStart
        });
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
