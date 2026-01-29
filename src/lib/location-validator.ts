import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Schema for city validation and normalization result
 */
const LocationSchema = z.object({
    cityEnglish: z.string().describe('Normalized English city name for APIs'),
    cityLocal: z.string().describe('Local language city name for display'),
    isValid: z.boolean().describe('Is this a real city in the specified country?'),
    suggestion: z.string().optional().describe('Suggested correction if invalid'),
    confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of validation'),
});

export type LocationValidation = z.infer<typeof LocationSchema>;

/**
 * Validate and normalize a city name using AI
 * 
 * @param cityInput - User's input (can be in any language, with typos, etc.)
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "PL", "US")
 * @returns Validation result with normalized names
 * 
 * @example
 * ```ts
 * const result = await validateAndNormalizeCity("Warszawa", "PL");
 * // { cityEnglish: "Warsaw", cityLocal: "Warszawa", isValid: true, confidence: "high" }
 * 
 * const result2 = await validateAndNormalizeCity("Nowy Jork", "US");
 * // { cityEnglish: "New York", cityLocal: "New York", isValid: true, confidence: "high" }
 * 
 * const result3 = await validateAndNormalizeCity("Xyz123", "PL");
 * // { isValid: false, suggestion: "Did you mean Poznań?", confidence: "low" }
 * ```
 */
export async function validateAndNormalizeCity(
    cityInput: string,
    countryCode: string
): Promise<LocationValidation> {
    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash-lite'),
            schema: LocationSchema,
            prompt: `
You are a geographic location validator and normalizer.

Task: Validate and normalize this city name for API usage.

Input:
- City: "${cityInput}"
- Country Code: ${countryCode}

Requirements:
1. Check if this is a real, existing city in country ${countryCode}
2. Return the standard ENGLISH name used by international APIs (e.g., Weather API, Google Trends)
3. Return the LOCAL language name for display purposes
4. If the city doesn't exist, suggest the closest real city or mark as invalid

Examples:

Input: "Warszawa" in PL
Output: { cityEnglish: "Warsaw", cityLocal: "Warszawa", isValid: true, confidence: "high" }

Input: "Nowy Jork" in US
Output: { cityEnglish: "New York", cityLocal: "New York", isValid: true, confidence: "high" }

Input: "Krakow" in PL
Output: { cityEnglish: "Krakow", cityLocal: "Kraków", isValid: true, confidence: "high" }

Input: "Poznan" in PL
Output: { cityEnglish: "Poznan", cityLocal: "Poznań", isValid: true, confidence: "high" }

Input: "Xyz123" in PL
Output: { cityEnglish: "", cityLocal: "", isValid: false, suggestion: "Invalid city name. Did you mean Poznań?", confidence: "low" }

Input: "LA" in US
Output: { cityEnglish: "Los Angeles", cityLocal: "Los Angeles", isValid: true, confidence: "medium" }

Important:
- cityEnglish should be the name that works with Weather APIs and Google Trends
- cityLocal should preserve local characters (ą, ę, ó, ł, etc. for Polish)
- Be lenient with typos and abbreviations
- Common abbreviations are valid (LA → Los Angeles, NYC → New York)
`,
        });

        return object;
    } catch (error) {
        console.error('[Location Validator] Error:', error);

        // Fallback: return input as-is with low confidence
        return {
            cityEnglish: cityInput,
            cityLocal: cityInput,
            isValid: true, // Allow to proceed even if AI fails
            confidence: 'low',
            suggestion: 'Could not validate - AI service unavailable. Please verify manually.',
        };
    }
}

/**
 * Quick validation without normalization (for checking if city exists)
 */
export async function isCityValid(cityInput: string, countryCode: string): Promise<boolean> {
    const result = await validateAndNormalizeCity(cityInput, countryCode);
    return result.isValid;
}
