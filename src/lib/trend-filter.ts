import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Define schema for the filter output
const FilterSchema = z.object({
    uniqueTrends: z.array(z.object({
        query: z.string(),
        traffic: z.string(),
        matchReason: z.string().optional().describe("Why this trend is considered unique (or kept)"),
    })),
    droppedTrends: z.array(z.string()).describe("Names of trends that were removed due to duplication"),
});

export type FilteredTrend = {
    query: string;
    traffic: string;
};

/**
 * Uses AI to semantically filter out trends that have already been discussed.
 * Handles language differences (e.g. Bridgerton vs Bridgertonowie) and partial matches.
 */
export async function filterUniqueTrends(
    newTrends: { query: string; traffic: string }[],
    recentMemories: string
): Promise<FilteredTrend[]> {
    if (!newTrends.length) return [];
    if (!recentMemories || recentMemories.length < 10) return newTrends;

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash-lite'),
            schema: FilterSchema,
            temperature: 0.1, // Low temp for strict logic
            prompt: `
            You are a strict duplication filter for an AI content creator.
            
            INPUTS:
            1. RECENT MEMORIES (Topics already discussed):
            "${recentMemories}"

            2. NEW TRENDING TOPICS (Candidates):
            ${JSON.stringify(newTrends.map(t => t.query))}

            TASK:
            Filter out ANY trending topic that is semantically similar to topics mentioned in Recent Memories.
            - "Bridgerton" matches "Bridgertonowie" -> DROP IT.
            - "iPhone 16" matches "New Apple Phone" -> DROP IT.
            - "Porto vs Rangers" matches "watching the match" (if general) -> KEEP IT (unless specific match mentioned).
            
            Return ONLY the trends that are FRESH and NOT discussed yet.
            `,
        });

        // Map back to original objects to keep traffic data
        const uniqueQueries = new Set(object.uniqueTrends.map(u => u.query));
        return newTrends.filter(t => uniqueQueries.has(t.query));

    } catch (error) {
        console.error('[TrendFilter] AI filtering failed, falling back to manual filter:', error);
        // Fallback: Return all (or simple filter) if AI fails logic
        return newTrends;
    }
}
