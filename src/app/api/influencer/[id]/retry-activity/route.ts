import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { memoryId, force } = body;

        console.log(`[API] Triggering manual retry for influencer ${id}, memory: ${memoryId}`);

        if (!memoryId && !force) {
            return NextResponse.json({ error: 'Missing memoryId or force flag' }, { status: 400 });
        }

        // Trigger the cycle start event with explicit retry parameters
        // The updated lifecycle.ts will detect 'retryMemoryId' and rehydrate the plan from it
        const result = await inngest.send({
            name: 'livra/cycle.start',
            data: {
                influencerId: id,
                retryMemoryId: memoryId,
                // We add initialDelay=0 explicitly to skip any weird delays if we are manually retrying
                // actually, we don't need initialDelay if we want it to run now.
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Retry triggered successfully',
            eventIds: result.ids
        });

    } catch (error) {
        console.error('[API] Failed to trigger retry:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
