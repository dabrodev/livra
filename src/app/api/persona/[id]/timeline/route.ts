import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUser } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getOrCreateUser();

        // Verify ownership
        const persona = await prisma.persona.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!persona) {
            return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
        }
        if (persona.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const searchParams = request.nextUrl.searchParams;
        const postsOffset = parseInt(searchParams.get('postsOffset') || '0');
        const memoriesOffset = parseInt(searchParams.get('memoriesOffset') || '0');
        const limit = 20; // Load 20 items per request

        const [posts, memories] = await Promise.all([
            prisma.post.findMany({
                where: { personaId: id },
                orderBy: { postedAt: 'desc' },
                skip: postsOffset,
                take: limit,
            }),
            prisma.memory.findMany({
                where: { personaId: id },
                orderBy: { createdAt: 'desc' },
                skip: memoriesOffset,
                take: limit,
            }),
        ]);

        return NextResponse.json({
            posts,
            memories,
            hasMorePosts: posts.length === limit,
            hasMoreMemories: memories.length === limit,
        });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timeline' },
            { status: 500 }
        );
    }
}
