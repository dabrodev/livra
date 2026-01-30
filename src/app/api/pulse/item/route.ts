import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'memory' | 'post'

    if (!id || !type) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        let item = null;
        if (type === 'memory') {
            const memory = await prisma.memory.findUnique({
                where: { id },
                include: {
                    persona: {
                        select: { id: true, name: true, faceReferences: true, isPublic: true }
                    }
                }
            });
            if (memory && memory.persona.isPublic) {
                item = {
                    id: memory.id,
                    type: 'memory',
                    content: memory.description,
                    timestamp: memory.createdAt,
                    persona: memory.persona,
                    importance: memory.importance
                };
            }
        } else if (type === 'post') {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    persona: {
                        select: { id: true, name: true, faceReferences: true, isPublic: true }
                    }
                }
            });
            if (post && post.persona.isPublic) {
                item = {
                    id: post.id,
                    type: 'post',
                    content: post.contentUrl,
                    caption: post.caption,
                    timestamp: post.postedAt,
                    persona: post.persona,
                    importance: 5
                };
            }
        }

        if (!item) {
            return NextResponse.json({ error: 'Item not found or private' }, { status: 404 });
        }

        return NextResponse.json(item);

    } catch (error) {
        console.error('Error fetching pulse item:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
