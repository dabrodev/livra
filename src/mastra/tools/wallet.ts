import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * Update an persona's wallet balance
 */
export async function updateWallet(personaId: string, amount: number, reason: string) {
    try {
        const persona = await prisma.persona.update({
            where: { id: personaId },
            data: {
                currentBalance: { increment: amount },
            },
        });
        return {
            success: true,
            newBalance: persona.currentBalance,
            transaction: { amount, reason },
        };
    } catch {
        return { success: false, error: "Failed to update wallet" };
    }
}

export const walletTool = createTool({
    id: "update-wallet",
    description: "Update the persona's wallet balance after spending or earning money.",
    inputSchema: z.object({
        personaId: z.string().describe("The persona's ID"),
        amount: z.number().describe("Amount to add (positive) or subtract (negative)"),
        reason: z.string().describe("Reason for the transaction"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        newBalance: z.number().optional(),
        transaction: z.object({
            amount: z.number(),
            reason: z.string(),
        }).optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        return updateWallet(context.personaId, context.amount, context.reason);
    },
});
