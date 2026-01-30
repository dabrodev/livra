import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch recent memories from public personas
        const memories = await prisma.memory.findMany({
            where: {
                persona: {
                    isPublic: true,
                    isActive: true // Only active personas
                }
            },
            take: 20,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                persona: {
                    select: {
                        id: true,
                        name: true,
                        faceReferences: true, // we'll use first face ref as avatar
                    }
                }
            }
        });

        // Fetch recent posts from public personas
        const posts = await prisma.post.findMany({
            where: {
                persona: {
                    isPublic: true,
                    isActive: true
                }
            },
            take: 20,
            orderBy: {
                postedAt: 'desc',
            },
            include: {
                persona: {
                    select: {
                        id: true,
                        name: true,
                        faceReferences: true,
                    }
                }
            }
        });

        // Combine and sort
        const timelineItems = [
            ...memories.map((m) => ({
                id: m.id,
                type: 'memory',
                content: m.description,
                timestamp: m.createdAt,
                persona: m.persona,
                importance: m.importance
            })),
            ...posts.map((p) => ({
                id: p.id,
                type: 'post',
                content: p.contentUrl,
                caption: p.caption,
                timestamp: p.postedAt,
                persona: p.persona,
                importance: 5 // Posts are always high importance
            })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 50); // Limit total items

        return NextResponse.json(timelineItems);
    } catch (error) {
        console.error('Error fetching pulse:', error);
        return NextResponse.json({ error: 'Failed to fetch pulse' }, { status: 500 });
    }
}
