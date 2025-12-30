import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Gemini 2.0 Flash Model via Mastra's model router
// Mastra will auto-detect GOOGLE_GENERATIVE_AI_API_KEY from environment
const GEMINI_MODEL = "google/gemini-2.0-flash";

// =============================================================================
// Utility Functions (can be called directly from Inngest workflows)
// =============================================================================

export type WeatherResult = {
    city: string;
    condition: string;
    temp: number;
    description: string;
};

export type TrendsResult = {
    category: string;
    trends: string[];
    tip: string;
};

export type Category = "lifestyle" | "fashion" | "food" | "fitness" | "travel";

/**
 * Get weather for a city (placeholder - integrate with real API later)
 */
export async function getWeather(city: string): Promise<WeatherResult> {
    const weatherConditions = [
        { condition: "sunny", temp: 25, description: "Clear skies, perfect for outdoors" },
        { condition: "cloudy", temp: 18, description: "Overcast but dry" },
        { condition: "rainy", temp: 15, description: "Light rain, indoor activities recommended" },
        { condition: "snowy", temp: -2, description: "Snow falling, cozy indoor vibes" },
    ];
    const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    return { city, ...weather };
}

/**
 * Get trending topics for a category (placeholder - integrate with social APIs later)
 */
export async function getTrends(category: Category): Promise<TrendsResult> {
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
}

/**
 * Update an influencer's wallet balance
 */
export async function updateWallet(influencerId: string, amount: number, reason: string) {
    try {
        const influencer = await prisma.influencer.update({
            where: { id: influencerId },
            data: {
                currentBalance: { increment: amount },
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
}

/**
 * Create a memory for an influencer
 */
export async function createMemory(influencerId: string, description: string, importance: number) {
    try {
        const memory = await prisma.memory.create({
            data: { influencerId, description, importance },
        });
        return { success: true, memoryId: memory.id };
    } catch {
        return { success: false, error: "Failed to create memory" };
    }
}

// =============================================================================
// Mastra Tools (wrap the utility functions for agent use)
// =============================================================================

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
        return getWeather(context.city);
    },
});

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
        return getTrends(context.category);
    },
});

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
        return updateWallet(context.influencerId, context.amount, context.reason);
    },
});

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
        return createMemory(context.influencerId, context.description, context.importance);
    },
});

// =============================================================================
// System Prompt and Agent
// =============================================================================

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
        maxSteps: 5,
    });
    return result;
}
