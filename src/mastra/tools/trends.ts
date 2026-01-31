import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

const SerpApi = require('google-search-results-nodejs');

export type Category = "lifestyle" | "fashion" | "food" | "fitness" | "travel";

export type TrendingArticle = {
    title: string;
    source: string;
    snippet?: string;
    link?: string;
};

export type TrendingTopic = {
    query: string;
    traffic: string; // e.g., "200K+"
    relatedQueries?: string[];
    articles?: TrendingArticle[];
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

        // Helper to fetch news context via Google News RSS (Scraping equivalent)
        async function fetchNewsContext(query: string, geo: string = 'US'): Promise<TrendingArticle[]> {
            try {
                const encodedQuery = encodeURIComponent(query);
                const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-${geo}&gl=${geo}&ceid=${geo}:en`;

                const response = await fetch(rssUrl);
                const xmlText = await response.text();

                // Simple regex parsing for RSS items (safer/lighter than adding xml2js)
                const items: TrendingArticle[] = [];
                const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>/gi;

                let match;
                // Get top 2 articles
                while ((match = itemRegex.exec(xmlText)) !== null && items.length < 2) {
                    // Clean up CDATA and HTML tags
                    const clean = (text: string) => text.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();

                    items.push({
                        title: clean(match[1]),
                        link: match[2],
                        source: "Google News", // RSS doesn't strictly give source name easily in regex, keep generic or parse description source
                        snippet: clean(match[4]) // Description often contains the snippet
                    });
                }
                return items;
            } catch (error) {
                console.warn(`[Trends] Failed to fetch news for ${query}:`, error);
                return [];
            }
        }

        // ... inside execute ...

        // Extract trending searches
        const trendingSearches = results.trending_searches || [];

        // Filter and format trending topics
        // We only fetch context for top 5 to avoid timeouts/rate-limits
        const topTrends = trendingSearches.slice(0, 5);
        const contextPromises = topTrends.map(async (item: any) => {
            const query = item.query || '';
            const articles = await fetchNewsContext(query, geo);

            return {
                query,
                traffic: item.search_volume ? `${item.search_volume}+` : (item.traffic || 'N/A'),
                relatedQueries: item.related_queries?.map((q: any) => q.query).slice(0, 3) || [],
                articles: articles // Now populated with real scraped data!
            };
        });

        const trendingTopicsWithContext = await Promise.all(contextPromises);

        // Map back to strict type (filtering out empty queries if any)
        const trendingTopics: TrendingTopic[] = trendingTopicsWithContext
            .filter((t: any) => t.query);

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
                    data: result as any, // Json type
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
