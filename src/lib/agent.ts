import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Gemini 2.0 Flash Model via Mastra's model router
// Mastra will auto-detect GOOGLE_GENERATIVE_AI_API_KEY from environment
const GEMINI_MODEL = "google/gemini-2.0-flash";

// Life Director Agent Tools (using Mastra's createTool format)

// Tool: Get current weather for influencer's city
export const getWeatherTool = createTool({
    id: "get-weather",
    description: "Get current weather conditions for a city. Use this to decide outdoor activities.",
    inputSchema: z.object({
        city: z.string().describe("The city to get weather for"),
    }),
    outputSchema: z.object({
        city: z.string(),
        condition: z.string(),
        temp: z.number(),
        description: z.string(),
    }),
    execute: async ({ context }) => {
        const { city } = context;
        // Placeholder - later integrate with real weather API
        const weatherConditions = [
            { condition: "sunny", temp: 25, description: "Clear skies, perfect for outdoors" },
            { condition: "cloudy", temp: 18, description: "Overcast but dry" },
            { condition: "rainy", temp: 15, description: "Light rain, indoor activities recommended" },
            { condition: "snowy", temp: -2, description: "Snow falling, cozy indoor vibes" },
        ];
        const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        return {
            city,
            ...weather,
        };
    },
});

// Tool: Get trending topics for content ideas
export const getTrendsTool = createTool({
    id: "get-trends",
    description: "Get current trending topics and hashtags. Use this for content inspiration.",
    inputSchema: z.object({
        category: z.enum(["lifestyle", "fashion", "food", "fitness", "travel"]).describe("Category to get trends for"),
    }),
    outputSchema: z.object({
        category: z.string(),
        trends: z.array(z.string()),
        tip: z.string(),
    }),
    execute: async ({ context }) => {
        const { category } = context;
        // Placeholder trends - later integrate with social media APIs
        const trendsByCategory: Record<string, string[]> = {
            lifestyle: ["#morningroutine", "#selfcare", "#productivity", "#cozyvibes"],
            fashion: ["#ootd", "#streetstyle", "#minimalfashion", "#thriftflip"],
            food: ["#coffeelover", "#brunchtime", "#healthyeating", "#foodporn"],
            fitness: ["#gymmotivation", "#yogalife", "#homeworkout", "#wellnessjourney"],
            travel: ["#wanderlust", "#cityexplore", "#weekendvibes", "#localguide"],
        };
        return {
            category,
            trends: trendsByCategory[category] || trendsByCategory.lifestyle,
            tip: "Use these trends in your next post for better engagement",
        };
    },
});

// Tool: Update influencer's wallet balance
export const updateWalletTool = createTool({
    id: "update-wallet",
    description: "Update the influencer's wallet balance after spending or earning money.",
    inputSchema: z.object({
        influencerId: z.string().describe("The influencer's ID"),
        amount: z.number().describe("Amount to add (positive) or subtract (negative)"),
        reason: z.string().describe("Reason for the transaction"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        newBalance: z.number().optional(),
        transaction: z.object({
            amount: z.number(),
            reason: z.string(),
        }).optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { influencerId, amount, reason } = context;
        try {
            const influencer = await prisma.influencer.update({
                where: { id: influencerId },
                data: {
                    currentBalance: {
                        increment: amount,
                    },
                },
            });
            return {
                success: true,
                newBalance: influencer.currentBalance,
                transaction: { amount, reason },
            };
        } catch {
            return { success: false, error: "Failed to update wallet" };
        }
    },
});

// Tool: Create a memory for the influencer
export const createMemoryTool = createTool({
    id: "create-memory",
    description: "Store a memory of an event or experience for the influencer.",
    inputSchema: z.object({
        influencerId: z.string().describe("The influencer's ID"),
        description: z.string().describe("Description of the memory/event"),
        importance: z.number().min(1).max(5).describe("Importance level 1-5"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        memoryId: z.string().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { influencerId, description, importance } = context;
        try {
            const memory = await prisma.memory.create({
                data: { influencerId, description, importance },
            });
            return { success: true, memoryId: memory.id };
        } catch {
            return { success: false, error: "Failed to create memory" };
        }
    },
});

// System prompt for Life Director
const LIFE_DIRECTOR_SYSTEM_PROMPT = `You are the Life Director for an AI influencer. Your role is to simulate a realistic day-to-day life for your influencer character.

You make decisions about:
1. Daily activities (morning routine, meals, shopping, exercise, socializing)
2. Content creation (when to take photos, what to post, captions)
3. Spending decisions (based on personality and budget)
4. Mood and energy levels throughout the day

Guidelines:
- Consider the influencer's personality vibe when making decisions
- Factor in weather conditions for outdoor activities
- Balance content creation with authentic life moments
- Be mindful of the budget - don't overspend
- Create memorable moments that feel genuine
- Vary activities based on day of the week

When asked to plan activities, return a structured response with:
- Activity name
- Time of day
- Location (if applicable)
- Whether it's content-worthy
- Estimated cost (if any)
- Mood/energy impact`;

// The Life Director Agent (Mastra Agent)
export const lifeDirectorAgent = new Agent({
    name: "life-director",
    instructions: LIFE_DIRECTOR_SYSTEM_PROMPT,
    model: GEMINI_MODEL,
    tools: {
        getWeather: getWeatherTool,
        getTrends: getTrendsTool,
        updateWallet: updateWalletTool,
        createMemory: createMemoryTool,
    },
});

// Main agent function - wrapper for backward compatibility
export async function runLifeDirector(prompt: string) {
    const result = await lifeDirectorAgent.generate(prompt, {
        maxSteps: 5, // Allow up to 5 tool calls
    });

    return result;
}
