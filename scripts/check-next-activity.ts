
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkPersonaStatus() {
    // Dynamic imports
    const { prisma } = await import('../src/lib/db');

    const personaId = '4fe62f64-c7a9-4f8f-b049-8456f21ade3d';

    const persona = await prisma.persona.findUnique({
        where: { id: personaId },
        include: {
            posts: {
                where: {
                    postedAt: {
                        gt: new Date() // Future posts
                    }
                },
                orderBy: {
                    postedAt: 'asc'
                }
            }
        }
    });

    if (!persona) {
        console.log('❌ Persona not found');
        return;
    }

    console.log('--- Persona Status ---');
    console.log(`Name: ${persona.name}`);
    console.log(`Lifecycle Status: ${persona.lifecycleStatus}`);
    console.log(`Current Activity: ${persona.currentActivity}`);
    console.log(`Activity Details: ${persona.activityDetails}`);
    console.log(`Activity Started At: ${persona.activityStartedAt}`);

    console.log('\n--- Scheduled Posts (Future) ---');
    if (persona.posts.length === 0) {
        console.log('No future posts found in DB.');
    } else {
        persona.posts.forEach(p => {
            console.log(`- [${p.type}] ${p.postedAt.toISOString()}: ${p.caption.substring(0, 50)}...`);
        });
    }
}

checkPersonaStatus()
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
