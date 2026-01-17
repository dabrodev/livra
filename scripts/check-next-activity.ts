
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkInfluencerStatus() {
    // Dynamic imports
    const { prisma } = await import('../src/lib/db');

    const influencerId = '4fe62f64-c7a9-4f8f-b049-8456f21ade3d';

    const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
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

    if (!influencer) {
        console.log('❌ Influencer not found');
        return;
    }

    console.log('--- Influencer Status ---');
    console.log(`Name: ${influencer.name}`);
    console.log(`Lifecycle Status: ${influencer.lifecycleStatus}`);
    console.log(`Current Activity: ${influencer.currentActivity}`);
    console.log(`Activity Details: ${influencer.activityDetails}`);
    console.log(`Activity Started At: ${influencer.activityStartedAt}`);

    console.log('\n--- Scheduled Posts (Future) ---');
    if (influencer.posts.length === 0) {
        console.log('No future posts found in DB.');
    } else {
        influencer.posts.forEach(p => {
            console.log(`- [${p.type}] ${p.postedAt.toISOString()}: ${p.caption.substring(0, 50)}...`);
        });
    }
}

checkInfluencerStatus()
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
