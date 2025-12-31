import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * Update an influencer's wallet balance
 */
export async function updateWallet(influencerId: string, amount: number, reason: string) {
    try {
        const influencer = await prisma.influencer.update({
            where: { id: influencerId },
            data: {
                currentBalance: { increment: amount },
            },
        });
        return {
            success: true,
            newBalance: influencer.currentBalance,
            transaction: { amount, reason },
        };
    } catch {
        return { success: false, error: "Failed to update wallet" };
    }
}

export const walletTool = createTool({
    id: "update-wallet",
    description: "Update the influencer's wallet balance after spending or earning money.",
    inputSchema: z.object({
        influencerId: z.string().describe("The influencer's ID"),
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
        return updateWallet(context.influencerId, context.amount, context.reason);
    },
});
