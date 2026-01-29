import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const SerpApi = require('google-search-results-nodejs');

export type Category = "lifestyle" | "fashion" | "food" | "fitness" | "travel";

export type TrendingTopic = {
    query: string;
    traffic: string; // e.g., "200K+"
    relatedQueries?: string[];
};

export type TrendsResult = {
    category: string;
    trends: string[];
    trendingTopics?: TrendingTopic[];
    tip: string;
    source: 'serpapi' | 'fallback';
};

// Fallback static trends (used when API fails or no API key)
const FALLBACK_TRENDS: Record<string, string[]> = {
    lifestyle: ["#morningroutine", "#selfcare", "#productivity", "#cozyvibes"],
    fashion: ["#ootd", "#streetstyle", "#minimalfashion", "#thriftflip"],
    food: ["#coffeelover", "#brunchtime", "#healthyeating", "#foodporn"],
    fitness: ["#gymmotivation", "#yogalife", "#homeworkout", "#wellnessjourney"],
    travel: ["#wanderlust", "#cityexplore", "#weekendvibes", "#localguide"],
};

/**
 * Get real-time trending topics from Google Trends via SerpAPI
 * 
 * @param category - Content category for fallback trends
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "PL", "US", "GB")
 * @returns Trending topics and hashtags
 */
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Cache duration: 4 hours (in milliseconds)
const CACHE_DURATION = 4 * 60 * 60 * 1000;

/**
 * Get real-time trending topics from Google Trends via SerpAPI
 * 
 * @param category - Content category for fallback trends
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "PL", "US", "GB")
 * @returns Trending topics and hashtags
 */
export async function getTrends(
    category: Category,
    countryCode?: string
): Promise<TrendsResult> {
    const geo = countryCode || 'US';

    // 1. Try to fetch from Cache first
    try {
        const cacheEntry = await (prisma as any).trendsCache.findUnique({
            where: {
                category_countryCode: {
                    category,
                    countryCode: geo
                }
            }
        });

        if (cacheEntry) {
            const isStale = new Date().getTime() - cacheEntry.updatedAt.getTime() > CACHE_DURATION;

            if (!isStale) {
                console.log(`[Trends] Using cached results for ${geo}/${category}`);
                return cacheEntry.data as unknown as TrendsResult;
            } else {
                console.log(`[Trends] Cache stale for ${geo}/${category}, refreshing...`);
            }
        }
    } catch (dbError) {
        console.warn(`[Trends] Cache read error, skipping cache:`, dbError);
        // Continue to API fetch if DB fails (don't block)
    }

    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
        console.warn('[Trends] SERPAPI_API_KEY not found, using fallback trends');
        return {
            category,
            trends: FALLBACK_TRENDS[category] || FALLBACK_TRENDS.lifestyle,
            tip: "Using fallback trends - add SERPAPI_API_KEY for real-time data",
            source: 'fallback',
        };
    }

    try {
        const search = new SerpApi.GoogleSearch(apiKey);

        // Fetch real-time trending searches
        const results = await new Promise<any>((resolve, reject) => {
            search.json({
                engine: "google_trends_trending_now",
                geo: geo,
                cat: "all",
            }, (data: any) => {
                if (data.error) {
                    reject(new Error(data.error));
                } else {
                    resolve(data);
                }
            });
        });

        // Extract trending searches
        const trendingSearches = results.trending_searches || [];

        // Filter and format trending topics
        const trendingTopics: TrendingTopic[] = trendingSearches
            .slice(0, 10)
            .map((item: any) => ({
                query: item.query || '',
                traffic: item.traffic || 'N/A',
                relatedQueries: item.related_queries?.map((q: any) => q.query).slice(0, 3) || [],
            }))
            .filter((t: TrendingTopic) => t.query);

        // Convert to hashtag-style trends for backward compatibility
        const trends = trendingTopics
            .map(t => `#${t.query.toLowerCase().replace(/\s+/g, '')}`)
            .slice(0, 5);

        // Add category-specific fallback if no trends found
        if (trends.length === 0) {
            console.warn('[Trends] No trends found from SerpAPI, using fallback');
            return {
                category,
                trends: FALLBACK_TRENDS[category] || FALLBACK_TRENDS.lifestyle,
                tip: "No real-time trends available, using fallback",
                source: 'fallback',
            };
        }

        const result: TrendsResult = {
            category,
            trends,
            trendingTopics,
            tip: `Real-time trending searches in ${geo}`,
            source: 'serpapi',
        };

        // 2. Save to Cache
        try {
            await (prisma as any).trendsCache.upsert({
                where: {
                    category_countryCode: {
                        category,
                        countryCode: geo
                    }
                },
                update: {
                    data: result as any, // Json type
                    updatedAt: new Date(),
                },
                create: {
                    category,
                    countryCode: geo,
                    data: result as any,
                }
            });
            console.log(`[Trends] Cached results for ${geo}/${category}`);
        } catch (cacheError) {
            console.error(`[Trends] Failed to update cache:`, cacheError);
        }

        return result;

    } catch (error) {
        console.error('[Trends] SerpAPI error:', error);

        // If API fails, try to return stale cache as backup
        try {
            const cacheEntry = await (prisma as any).trendsCache.findUnique({
                where: { category_countryCode: { category, countryCode: geo } }
            });
            if (cacheEntry) {
                console.log(`[Trends] API failed, using STALE cache for ${geo}/${category}`);
                return cacheEntry.data as unknown as TrendsResult;
            }
        } catch (e) { /* ignore */ }

        return {
            category,
            trends: FALLBACK_TRENDS[category] || FALLBACK_TRENDS.lifestyle,
            tip: "API error - using fallback trends",
            source: 'fallback',
        };
    }
}

export const trendsTool = createTool({
    id: "get-trends",
    description: "Get real-time trending topics from Google Trends for a specific country. Use this for content inspiration based on what's trending NOW in the persona's location.",
    inputSchema: z.object({
        category: z.enum(["lifestyle", "fashion", "food", "fitness", "travel"]).describe("Category to get trends for"),
        countryCode: z.string().optional().describe("ISO 3166-1 alpha-2 country code (e.g., 'PL', 'US', 'GB')"),
    }),
    outputSchema: z.object({
        category: z.string(),
        trends: z.array(z.string()),
        trendingTopics: z.array(z.object({
            query: z.string(),
            traffic: z.string(),
            relatedQueries: z.array(z.string()).optional(),
        })).optional(),
        tip: z.string(),
        source: z.enum(['serpapi', 'fallback']),
    }),
    execute: async ({ context }) => {
        return getTrends(context.category, context.countryCode);
    },
});
