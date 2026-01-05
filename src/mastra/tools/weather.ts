import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export type WeatherResult = {
    city: string;
    condition: string;
    temp: number;
    description: string;
};

// City coordinates for Open-Meteo API
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
    'New York': { lat: 40.7128, lon: -74.0060 },
    'Los Angeles': { lat: 34.0522, lon: -118.2437 },
    'London': { lat: 51.5074, lon: -0.1278 },
    'Berlin': { lat: 52.5200, lon: 13.4050 },
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'Dubai': { lat: 25.2048, lon: 55.2708 },
    'Tokyo': { lat: 35.6762, lon: 139.6503 },
    'Mumbai': { lat: 19.0760, lon: 72.8777 },
    'Sydney': { lat: -33.8688, lon: 151.2093 },
    'São Paulo': { lat: -23.5505, lon: -46.6333 },
    'Lagos': { lat: 6.5244, lon: 3.3792 },
    'Stockholm': { lat: 59.3293, lon: 18.0686 },
    'Warsaw': { lat: 52.2297, lon: 21.0122 },
    'Krakow': { lat: 50.0647, lon: 19.9450 },
};

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
function interpretWeatherCode(code: number): { condition: string; description: string } {
    if (code === 0) return { condition: 'sunny', description: 'Clear skies, perfect for outdoors' };
    if (code <= 3) return { condition: 'cloudy', description: 'Partly cloudy but pleasant' };
    if (code <= 67) return { condition: 'rainy', description: 'Rainy weather, indoor activities recommended' };
    if (code <= 77) return { condition: 'snowy', description: 'Snow falling, cozy indoor vibes' };
    return { condition: 'cloudy', description: 'Overcast weather' };
}

/**
 * Get real-time weather using Open-Meteo API (free, no API key needed)
 */
export async function getWeather(city: string): Promise<WeatherResult> {
    const coords = CITY_COORDINATES[city];

    if (!coords) {
        console.warn(`No coordinates for city: ${city}, using default weather`);
        return {
            city,
            condition: 'sunny',
            temp: 20,
            description: 'Pleasant weather'
        };
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.status}`);
        }

        const data = await response.json();
        const temp = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        const { condition, description } = interpretWeatherCode(weatherCode);

        return { city, condition, temp, description };
    } catch (error) {
        console.error('Failed to fetch weather from Open-Meteo:', error);
        // Fallback to pleasant default
        return {
            city,
            condition: 'sunny',
            temp: 20,
            description: 'Pleasant weather (fallback)'
        };
    }
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
