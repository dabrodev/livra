
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const { prisma } = await import('../src/lib/db');

    const personaId = process.argv[2];
    if (!personaId) {
        console.error("Please provide Persona ID");
        process.exit(1);
    }

    console.log(`Checking data for Persona: ${personaId}`);

    // 1. Get Persona basic info
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
        console.error("Persona not found!");
        return;
    }
    console.log(`Name: ${persona.name}`);
    console.log(`Current Activity: ${persona.currentActivity} (Status: ${persona.lifecycleStatus})`);

    // 2. Get Last Memory
    const lastMemory = await prisma.memory.findFirst({
        where: { personaId },
        orderBy: { createdAt: 'desc' }
    });
    console.log("\n--- LAST MEMORY ---");
    console.log(lastMemory ? lastMemory.description : "No memories found.");

    // 3. Get Last Post (Image Prompt)
    try {
        const lastPost = await prisma.post.findFirst({
            where: { personaId },
            orderBy: { postedAt: 'desc' }
        });
        console.log("\n--- LAST POST (Image Prompt) ---");
        if (lastPost) {
            console.log(`Caption: ${lastPost.caption}`);
            console.log(`Prompt:`);
            console.log(lastPost.prompt || "No prompt saved.");
        } else {
            console.log("No posts found.");
        }
    } catch (e: any) {
        console.log("Could not fetch posts (maybe createdAt missing?):", e.message);
    }

    await prisma.$disconnect();
}

main().catch(e => console.error(e));
