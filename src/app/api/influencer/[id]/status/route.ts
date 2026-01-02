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
        const influencer = await prisma.influencer.update({
            where: { id },
            data: { isActive: active } as any,
        });

        // If activating, trigger the first cycle
        if (active) {
            await inngest.send({
                name: 'livra/cycle.start',
                data: { influencerId: id },
            });
        }

        return NextResponse.json({ success: true, active: (influencer as any).isActive });
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
