import { Agent } from "@mastra/core/agent";
import { weatherTool, trendsTool, walletTool, memoryTool } from "../tools";

// Gemini 2.0 Flash Model via Mastra's model router
const GEMINI_MODEL = "google/gemini-2.0-flash";

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

/**
 * Life Director Agent
 * 
 * The main AI agent that orchestrates an influencer's daily life.
 * Uses Gemini 2.0 Flash for reasoning and decision making.
 */
export const lifeDirectorAgent = new Agent({
    name: "life-director",
    instructions: LIFE_DIRECTOR_SYSTEM_PROMPT,
    model: GEMINI_MODEL,
    tools: {
        getWeather: weatherTool,
        getTrends: trendsTool,
        updateWallet: walletTool,
        createMemory: memoryTool,
    },
});

/**
 * Run the Life Director agent with a prompt
 */
export async function runLifeDirector(prompt: string) {
    const result = await lifeDirectorAgent.generate(prompt, {
        maxSteps: 5,
    });
    return result;
}
