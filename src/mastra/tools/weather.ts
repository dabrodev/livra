import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export type WeatherResult = {
    city: string;
    condition: string;
    temp: number;
    description: string;
};

/**
 * Get weather for a city
 * Placeholder - integrate with real weather API later
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

export const weatherTool = createTool({
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
