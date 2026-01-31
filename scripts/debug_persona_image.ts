
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPersona(id: string) {
    console.log(`🔍 Checking persona: ${id}...`);

    try {
        const persona = await prisma.persona.findUnique({
            where: { id },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                memories: {
                    orderBy: { createdAt: 'desc' },
                    where: { type: 'ERROR' }, // Check for errors
                    take: 5
                }
            },
        });

        if (!persona) {
            console.log('❌ Persona not found!');
            return;
        }

        console.log('👤 Persona Details:');
        console.log(`   Name: ${persona.name}`);
        console.log(`   Avatar URL: ${persona.avatarUrl || '❌ MISSING'}`);
        console.log(`   Model Provider: ${persona.modelProvider}`);
        console.log(`   Status: ${persona.status}`);

        console.log('\n📅 Recent Activities (Last 5):');
        if (persona.activities.length === 0) console.log('   No activities found.');

        persona.activities.forEach(activity => {
            console.log(`   [${activity.createdAt.toISOString()}] ${activity.name}`);
            console.log(`     Status: ${activity.status}`);
            console.log(`     Image URL: ${activity.imageUrl || '❌ MISSING'}`);
            // Show metadata if available to see generation errors
            if (activity.metadata) {
                console.log(`     Metadata: ${JSON.stringify(activity.metadata)}`);
            }
        });

        console.log('\n⚠️ Recent Error Memories:');
        if (persona.memories.length === 0) console.log('   No recorded errors.');
        persona.memories.forEach(mem => {
            console.log(`   [${mem.createdAt.toISOString()}] ${mem.content}`);
        });

    } catch (error) {
        console.error('❌ Error querying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const PERSONA_ID = 'e007502b-1eb8-43a7-98e9-72c120c34f90';
checkPersona(PERSONA_ID);
