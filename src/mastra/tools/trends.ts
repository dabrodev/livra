import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export type Category = "lifestyle" | "fashion" | "food" | "fitness" | "travel";

export type TrendsResult = {
    category: string;
    trends: string[];
    tip: string;
};

/**
 * Get trending topics for a category
 * Placeholder - integrate with social APIs later
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

export const trendsTool = createTool({
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
