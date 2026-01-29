
import * as dotenv from 'dotenv';
import path from 'path';
import { Inngest } from 'inngest';

// Load .env.local before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define Inngest client locally to avoid complex imports if not needed, 
// strictly for triggering events.
const inngest = new Inngest({ id: 'livra' });

async function recoverLifecycle() {
    // Dynamic imports to ensure env vars are loaded
    const { prisma } = await import('../src/lib/db');

    // Known Persona ID
    const personaId = '4fe62f64-c7a9-4f8f-b049-8456f21ade3d';

    console.log(`🕵️‍♀️ Analyzing status for persona: ${personaId}...`);

    const persona = await prisma.persona.findUnique({
        where: { id: personaId }
    });

    if (!persona) {
        console.error('❌ Persona not found!');
        return;
    }

    console.log(`\n📋 Current DB Status:`);
    console.log(`   - Lifecycle Status: ${persona.lifecycleStatus}`);
    console.log(`   - Current Activity: ${persona.currentActivity}`);
    console.log(`   - Details: ${persona.activityDetails}`);
    console.log(`   - Last Update: ${persona.activityStartedAt}`);

    // LOGIC: Smart Recovery
    if (persona.currentActivity === 'creating') {
        console.log(`\n⚠️  DETECTED STUCK STATE: 'creating'`);
        console.log(`   It seems the cycle failed during Image Generation.`);
        console.log(`   To avoid double-charging the wallet or duplicating memories, we will:`);
        console.log(`   1. Mark this activity as finished (skip image).`);
        console.log(`   2. Set status to 'resting'.`);
        console.log(`   3. Trigger the NEXT cycle immediately.`);

        // Update DB to "skip" the failed step and move to resting
        await prisma.persona.update({
            where: { id: personaId },
            data: {
                currentActivity: 'resting',
                activityDetails: 'Recovered from failed image generation (Manual Skip)',
                activityStartedAt: new Date()
            }
        });
        console.log(`\n✅ DB Updated: Status set to 'resting'.`);

        // Trigger next cycle
        console.log(`🚀 Sending 'livra/cycle.start' event to Inngest with 3h delay...`);
        await inngest.send({
            name: 'livra/cycle.start',
            data: {
                personaId,
                initialDelay: '3h' // Force 3h rest before next activity
            }
        });
        console.log(`✨ Event sent! The lifecycle should resume shortly.`);

    } else if (persona.lifecycleStatus === 'paused' || persona.lifecycleStatus === 'stopped') {
        console.log(`\nℹ️  Lifecycle is paused/stopped.`);
        console.log(`   Do you want to FORCE restart it? (Rerun script with --force)`);
    } else {
        console.log(`\n🤔 Status seems normal ('${persona.currentActivity}').`);
        console.log(`   If you believe it's stuck (e.g. 'planning' for hours), you can force a nudge.`);
        console.log(`   Run: npx tsx scripts/recover-lifecycle.ts --force`);

        if (process.argv.includes('--force')) {
            console.log(`\n💪 FORCE MODE: Triggering cycle.start anyway...`);
            await inngest.send({
                name: 'livra/cycle.start',
                data: { personaId }
            });
            console.log(`✨ Event sent!`);
        }
    }
}

recoverLifecycle()
    .catch(err => {
        console.error('Recovery failed:', err);
        process.exit(1);
    });
