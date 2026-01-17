import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * Create a memory for an persona
 */
export async function createMemory(personaId: string, description: string, importance: number) {
    try {
        const memory = await prisma.memory.create({
            data: { personaId, description, importance },
        });
        return { success: true, memoryId: memory.id };
    } catch {
        return { success: false, error: "Failed to create memory" };
    }
}

export const memoryTool = createTool({
    id: "create-memory",
    description: "Store a memory of an event or experience for the persona.",
    inputSchema: z.object({
        personaId: z.string().describe("The persona's ID"),
        description: z.string().describe("Description of the memory/event"),
        importance: z.number().min(1).max(5).describe("Importance level 1-5"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        memoryId: z.string().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        return createMemory(context.personaId, context.description, context.importance);
    },
});
