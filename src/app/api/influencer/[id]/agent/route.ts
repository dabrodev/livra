import { NextRequest, NextResponse } from "next/server";
import { runLifeDirector } from "@/mastra";
import { prisma } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action } = body; // "plan_day", "decide_activity", etc.

        // Get influencer data
        const influencer = await prisma.influencer.findUnique({
            where: { id },
            include: {
                memories: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });

        if (!influencer) {
            return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
        }

        // Build context for the agent
        const context = `
Influencer Profile:
- Name: ${influencer.name}
- ID: ${influencer.id}
- Location: ${influencer.city}, ${influencer.country}
- Personality: ${influencer.personalityVibe}
- Clothing Style: ${influencer.clothingStyle}
- Current Balance: $${influencer.currentBalance}
- Apartment: ${influencer.apartmentStyle}

Recent Memories:
${influencer.memories.map((m: { description: string }) => `- ${m.description}`).join("\n") || "No recent memories"}

Current Time: ${new Date().toLocaleTimeString()}
Day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}
`;

        let prompt = "";

        switch (action) {
            case "plan_day":
                prompt = `${context}\n\nPlan a complete day for this influencer. Include 5-8 activities from morning to evening. Consider their personality, style, and budget. Mark which activities are content-worthy.`;
                break;
            case "decide_activity":
                prompt = `${context}\n\nDecide what the influencer should do RIGHT NOW. Consider the time of day, their mood, and recent activities. Use the weather tool to check conditions first.`;
                break;
            case "create_content":
                prompt = `${context}\n\nThe influencer wants to create content. Use the trends tool to get inspiration, then describe a photo or video they should create. Include the setting, pose, outfit suggestion, and caption.`;
                break;
            default:
                prompt = `${context}\n\n${body.customPrompt || "What should this influencer do next?"}`;
        }

        // Run the Life Director agent
        const result = await runLifeDirector(prompt);

        return NextResponse.json({
            success: true,
            message: result.text,
            action,
            toolCalls: result.steps.flatMap(s => s.toolCalls),
            toolResults: result.steps.flatMap(s => s.toolResults),
        });

    } catch (error) {
        console.error("Agent error:", error);
        return NextResponse.json(
            { error: "Failed to process agent request", details: String(error) },
            { status: 500 }
        );
    }
}
