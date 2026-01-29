/**
 * Test script to verify SerpAPI real-time trends integration
 * Run: npx tsx scripts/test-trends-news.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getTrends } from '../src/mastra/tools/trends';

async function testTrends() {
    console.log('🔍 Testing Real-Time Trends API for Warsaw\n');
    console.log('='.repeat(80));

    // Test SerpAPI Trends
    console.log('\n🚀 SERPAPI - REAL-TIME TRENDING SEARCHES (JIT)');
    console.log('='.repeat(80));

    try {
        const trends = await getTrends('lifestyle', 'Warsaw');

        console.log(`\nSource: ${trends.source.toUpperCase()}`);
        console.log(`Tip: ${trends.tip}\n`);

        if (trends.trendingTopics && trends.trendingTopics.length > 0) {
            console.log('📈 Top Trending Topics:\n');
            trends.trendingTopics.forEach((topic, index) => {
                console.log(`${index + 1}. "${topic.query}"`);
                console.log(`   Traffic: ${topic.traffic}`);
                if (topic.relatedQueries && topic.relatedQueries.length > 0) {
                    console.log(`   Related: ${topic.relatedQueries.slice(0, 2).join(', ')}`);
                }
                console.log('');
            });
        } else {
            console.log('📊 Hashtag Trends:\n');
            trends.trends.forEach((trend, index) => {
                console.log(`${index + 1}. ${trend}`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('✅ SUCCESS - Real-Time Trends Integration Working!');
        console.log('='.repeat(80));

        if (trends.source === 'serpapi') {
            console.log(`
✨ SerpAPI is providing REAL-TIME trending searches for Warsaw!

What you're seeing:
- Live data from Google Trends
- What people in Poland are searching RIGHT NOW
- Perfect for JIT (Just-In-Time) activity planning

How it helps Livra:
- AI personas can react to current events
- Activities reflect what's trending today
- More engaging, timely content
- Realistic lifestyle simulation

Example Use Cases:
- "Liga Mistrzów" trending → Persona watches match at sports bar
- "Bridgertonowie" trending → Persona discusses new season at café
- "Kurs złota" trending → Persona checks financial news

Next Steps:
1. Start a persona lifecycle
2. Check Inngest dashboard (http://localhost:8288)
3. Look for trending topics in the activity planning step
4. See how trends influence the AI's decisions!
`);
        } else {
            console.log(`
⚠️  Using fallback trends (SERPAPI_API_KEY not found or invalid)

To enable real-time trends:
1. Get a free API key from https://serpapi.com
2. Add to .env.local: SERPAPI_API_KEY=your_key_here
3. Free tier: 100 searches/month (sufficient for development)
`);
        }

    } catch (error) {
        console.error('❌ SerpAPI Error:', error);
    }
}

testTrends().catch(console.error);
