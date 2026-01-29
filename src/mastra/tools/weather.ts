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
    'new york': { lat: 40.7128, lon: -74.0060 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'london': { lat: 51.5074, lon: -0.1278 },
    'berlin': { lat: 52.5200, lon: 13.4050 },
    'paris': { lat: 48.8566, lon: 2.3522 },
    'dubai': { lat: 25.2048, lon: 55.2708 },
    'tokyo': { lat: 35.6762, lon: 139.6503 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'sydney': { lat: -33.8688, lon: 151.2093 },
    'sao paulo': { lat: -23.5505, lon: -46.6333 },
    'lagos': { lat: 6.5244, lon: 3.3792 },
    'stockholm': { lat: 59.3293, lon: 18.0686 },
    'warsaw': { lat: 52.2297, lon: 21.0122 },
    'krakow': { lat: 50.0647, lon: 19.9450 },
    'cracow': { lat: 50.0647, lon: 19.9450 },
    'poznan': { lat: 52.4064, lon: 16.9252 },
    'gdansk': { lat: 54.3520, lon: 18.6466 },
    'wroclaw': { lat: 51.1079, lon: 17.0385 },
    'lodz': { lat: 51.7592, lon: 19.4560 },
};

/**
 * Normalize city name for lookup - handles accents and common variations
 */
function normalizeCity(city: string): string {
    return city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (ó -> o, etc.)
        .replace(/ł/g, 'l') // Polish ł -> l
        .trim();
}

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
 * Fetch coordinates for a city using Open-Meteo Geocoding API
 */
async function getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude
            };
        }
        return null;
    } catch (e) {
        console.warn(`[Weather] Geocoding failed for ${city}:`, e);
        return null; // Fallback to hardcoded list if API fails? For now just null.
    }
}

/**
 * Get real-time weather using Open-Meteo API (free, no API key needed)
 * Returns null if weather cannot be fetched
 */
export async function getWeather(city: string): Promise<WeatherResult | null> {
    // 1. Try to get coordinates dynamically
    let coords = await getCoordinates(city);

    // 2. Fallback to hardcoded list if dynamic lookup fails (e.g. rate limit or network issue)
    if (!coords) {
        const normalizedCity = normalizeCity(city);
        coords = CITY_COORDINATES[normalizedCity];
    }

    if (!coords) {
        console.warn(`[Weather] No coordinates found for city: ${city}`);
        return null;
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
        console.error('[Weather] Failed to fetch weather from Open-Meteo:', error);
        return null;
    }
}

export const weatherTool = createTool({
    id: "get-weather",
    description: "Get current weather conditions for a city. Use this to decide outdoor activities. Returns null if weather is unavailable.",
    inputSchema: z.object({
        city: z.string().describe("The city to get weather for"),
    }),
    outputSchema: z.object({
        city: z.string(),
        condition: z.string(),
        temp: z.number(),
        description: z.string(),
    }).nullable(),
    execute: async ({ context }) => {
        return getWeather(context.city);
    },
});
