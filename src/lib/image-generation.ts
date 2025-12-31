import { GoogleGenAI, type Part } from "@google/genai";

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Model for image generation (Gemini 3 Pro Image aka Nano Banana Pro)
const IMAGE_MODEL = "gemini-3-pro-image-preview";

// Types
export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    imageBase64?: string;
    mimeType?: string;
    description?: string;
    error?: string;
}

export interface ReferenceImage {
    base64Data: string;
    mimeType: string;
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
export type Resolution = "1K" | "2K" | "4K";

/**
 * Generate an image using Gemini 3 Pro Image (Nano Banana Pro)
 * Supports up to 14 reference images for character/scene consistency
 * 
 * @param prompt - Text prompt describing the image to generate
 * @param referenceImages - Optional array of reference images (up to 14)
 * @param options - Optional configuration for aspect ratio and resolution
 */
export async function generateImage(
    prompt: string,
    referenceImages?: ReferenceImage[],
    options?: {
        aspectRatio?: AspectRatio;
        resolution?: Resolution;
    }
): Promise<ImageGenerationResult> {
    try {
        // Build contents array
        const contents: Part[] = [{ text: prompt }];

        // Add reference images if provided (max 14)
        if (referenceImages && referenceImages.length > 0) {
            const maxImages = Math.min(referenceImages.length, 14);
            for (let i = 0; i < maxImages; i++) {
                contents.push({
                    inlineData: {
                        mimeType: referenceImages[i].mimeType,
                        data: referenceImages[i].base64Data,
                    },
                });
            }
        }

        // Generate content with image output
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: contents,
            config: {
                responseModalities: ["TEXT", "IMAGE"],
                imageConfig: {
                    aspectRatio: options?.aspectRatio || "1:1",
                    imageSize: options?.resolution || "2K",
                },
            },
        });

        // Process response parts
        let imageBase64: string | undefined;
        let mimeType: string | undefined;
        let description: string | undefined;

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    description = part.text;
                } else if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    mimeType = part.inlineData.mimeType;
                }
            }
        }

        if (imageBase64) {
            return {
                success: true,
                imageBase64,
                mimeType: mimeType || "image/png",
                description,
            };
        }

        return {
            success: false,
            error: "No image was generated",
            description,
        };
    } catch (error) {
        console.error("Image generation failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Generate an influencer image with face and room references
 * Uses the 14-slot reference stack as per specs
 * 
 * Slots:
 * - 1-6: Face/body consistency
 * - 7-12: Environment/location consistency  
 * - 13-14: Object/clothing consistency
 */
export async function generateInfluencerImage(
    prompt: string,
    faceReferences: string[], // URLs or base64
    roomReferences: string[], // URLs or base64
    options?: {
        aspectRatio?: AspectRatio;
        resolution?: Resolution;
    }
): Promise<ImageGenerationResult> {
    try {
        // Build reference images array following the 14-slot strategy
        const referenceImages: ReferenceImage[] = [];

        // Slots 1-6: Face references (max 6)
        for (let i = 0; i < Math.min(faceReferences.length, 6); i++) {
            const imageData = await fetchImageAsBase64(faceReferences[i]);
            if (imageData) {
                referenceImages.push(imageData);
            }
        }

        // Slots 7-12: Room/environment references (max 6)
        for (let i = 0; i < Math.min(roomReferences.length, 6); i++) {
            const imageData = await fetchImageAsBase64(roomReferences[i]);
            if (imageData) {
                referenceImages.push(imageData);
            }
        }

        // Generate with references
        return generateImage(prompt, referenceImages, options);
    } catch (error) {
        console.error("Influencer image generation failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Fetch an image from URL and convert to base64
 */
async function fetchImageAsBase64(urlOrBase64: string): Promise<ReferenceImage | null> {
    try {
        // If already base64, return as-is
        if (urlOrBase64.startsWith("data:")) {
            const matches = urlOrBase64.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                return {
                    mimeType: matches[1],
                    base64Data: matches[2],
                };
            }
        }

        // Fetch from URL
        const response = await fetch(urlOrBase64);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";

        return {
            mimeType: contentType,
            base64Data,
        };
    } catch (error) {
        console.error("Failed to fetch image:", error);
        return null;
    }
}

/**
 * Save base64 image data to Supabase Storage (placeholder)
 * TODO: Implement actual Supabase storage upload
 */
export async function saveGeneratedImage(
    imageBase64: string,
    mimeType: string,
    influencerId: string,
    postId: string
): Promise<string | null> {
    // TODO: Implement Supabase Storage upload
    // For now, return a data URL placeholder
    return `data:${mimeType};base64,${imageBase64}`;
}
