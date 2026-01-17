import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const user = await getOrCreateUser();

        const body = await request.json();

        const {
            country,
            city,
            neighborhood,
            apartmentStyle,
            name,
            type,
            gender,
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

        // Create persona in database with userId
        const persona = await prisma.persona.create({
            data: {
                userId: user.id, // Assign to current user
                name,
                type: type || "INFLUENCER",
                gender: gender || "female",
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

        // NOTE: Lifecycle is NOT triggered automatically
        // User must manually start it via the "Start Lifecycle" button
        // after creating an avatar (enforced by UI)

        return NextResponse.json({ id: persona.id }, { status: 201 });
    } catch (error) {
        console.error("Failed to create persona:", error);

        // Check if it's an auth error
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create persona" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Require authentication and filter by user
        const user = await getOrCreateUser();

        const personas = await prisma.persona.findMany({
            where: { userId: user.id }, // Only return user's personas
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return NextResponse.json(personas);
    } catch (error) {
        console.error("Failed to fetch personas:", error);

        // Check if it's an auth error
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch personas" },
            { status: 500 }
        );
    }
}
