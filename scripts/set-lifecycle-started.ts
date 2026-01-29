import { prisma } from '../src/lib/db';

async function main() {
    // Set lifecycleStartedAt for all personas that already have posts (meaning they were already started)
    const personas = await prisma.persona.findMany({
        where: {
            posts: { some: {} }
        },
        select: { id: true, name: true }
    });

    for (const persona of personas) {
        await prisma.persona.update({
            where: { id: persona.id },
            data: { lifecycleStartedAt: new Date() }
        });
        console.log(`Updated ${persona.name} with lifecycleStartedAt`);
    }

    console.log(`\nTotal updated: ${personas.length} personas`);
    await prisma.$disconnect();
}

main().catch(console.error);
