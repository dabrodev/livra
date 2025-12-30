import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            country,
            city,
            neighborhood,
            apartmentStyle,
            name,
            personalityVibe,
            clothingStyle,
            bottomwear,
            footwear,
            signatureItems,
            currentBalance,
        } = body;

        // Validate required fields
        if (!country || !city || !apartmentStyle || !name || !personalityVibe || !clothingStyle) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create influencer in database
        const influencer = await prisma.influencer.create({
            data: {
                name,
                country,
                city,
                neighborhood: neighborhood || null,
                apartmentStyle,
                personalityVibe,
                clothingStyle,
                bottomwear: bottomwear || [],
                footwear: footwear || [],
                signatureItems: signatureItems || [],
                currentBalance: currentBalance || 5000,
                faceReferences: [],
                roomReferences: [],
            },
        });

        // Trigger the autonomous lifecycle via Inngest
        await inngest.send({
            name: "daywithme/influencer.created",
            data: { influencerId: influencer.id },
        });

        return NextResponse.json({ id: influencer.id }, { status: 201 });
    } catch (error) {
        console.error("Failed to create influencer:", error);
        return NextResponse.json(
            { error: "Failed to create influencer" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const influencers = await prisma.influencer.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return NextResponse.json(influencers);
    } catch (error) {
        console.error("Failed to fetch influencers:", error);
        return NextResponse.json(
            { error: "Failed to fetch influencers" },
            { status: 500 }
        );
    }
}
