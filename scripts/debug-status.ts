import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function main() {
    console.log("--- DIAGNOSTIC START ---");
    const influencerId = "10e2c38c-19fb-497d-bd17-e82f4fa66c25";

    // Get last 5 memories
    const memories = await prisma.memory.findMany({
        where: { influencerId },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    // Get last 5 posts
    const posts = await prisma.post.findMany({
        where: { influencerId },
        take: 5,
        orderBy: { postedAt: 'desc' }
    });

    console.log(`Found ${memories.length} memories and ${posts.length} posts.`);

    console.log("\nRecent Memories:");
    memories.forEach(m => {
        console.log(`[ID: ${m.id}] ${m.createdAt.toISOString()} | ${m.description.substring(0, 50)}...`);
    });

    console.log("\nRecent Posts:");
    posts.forEach(p => {
        // Log stripped properties to be safe, assuming reverted schema (no memoryId)
        console.log(`[ID: ${p.id}] ${p.postedAt.toISOString()} | ${p.caption.substring(0, 50)}... | URL: ${p.contentUrl ? 'YES' : 'NO'}`);
    });
    console.log("--- DIAGNOSTIC END ---");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
