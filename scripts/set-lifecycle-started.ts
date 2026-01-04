import { prisma } from '../src/lib/db';

async function main() {
    // Set lifecycleStartedAt for all influencers that already have posts (meaning they were already started)
    const influencers = await prisma.influencer.findMany({
        where: {
            posts: { some: {} }
        },
        select: { id: true, name: true }
    });

    for (const inf of influencers) {
        await prisma.influencer.update({
            where: { id: inf.id },
            data: { lifecycleStartedAt: new Date() }
        });
        console.log(`Updated ${inf.name} with lifecycleStartedAt`);
    }

    console.log(`\nTotal updated: ${influencers.length} influencers`);
    await prisma.$disconnect();
}

main().catch(console.error);
