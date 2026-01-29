import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { getOrCreateUser } from "@/lib/auth";

import { getCountryByCode } from "@/lib/countries";

export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const user = await getOrCreateUser();

        const body = await request.json();

        const {
            country: countryInput, // Now receives code e.g. "PL"
            city: cityInput,
            normalizedCity,
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
        if (!countryInput || !cityInput || !apartmentStyle || !name || !personalityVibe || !clothingStyle) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Logic for country/city mapping
        const countryObj = getCountryByCode(countryInput);
        const countryName = countryObj ? countryObj.name : countryInput; // Fallback if not found (legacy behavior)
        const countryCode = countryObj ? countryObj.code : (countryInput.length === 2 ? countryInput : null);

        // Logic for city mapping
        // If we have a normalized city (e.g. "Warsaw"), use it as the main 'city' field for APIs
        // Store the original input (e.g. "Warszawa") as 'cityLocal'
        const mainCity = normalizedCity || cityInput;
        const localCity = cityInput;

        // Create persona in database with userId
        const persona = await prisma.persona.create({
            data: {
                userId: user.id, // Assign to current user
                name,
                type: type || "INFLUENCER",
                gender: gender || "female",
                country: countryName,
                countryCode: countryCode || 'US', // Fallback
                city: mainCity,
                cityLocal: localCity,
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
