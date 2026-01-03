
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixInfluencerImages() {
    console.log('🚀 Starting data cleanup: Moving Base64 images to Supabase Storage...');

    // Dynamic imports to ensure env vars are loaded before modules initialize
    const { prisma } = await import('../src/lib/db');
    const { saveGeneratedImage } = await import('../src/lib/image-generation');

    const influencers = await prisma.influencer.findMany();

    for (const influencer of influencers) {
        console.log(`\nProcessing Influencer: ${influencer.name} (${influencer.id})`);

        // 1. Fix faceReferences
        const newFaceRefs = [];
        let faceChanged = false;

        for (let i = 0; i < influencer.faceReferences.length; i++) {
            const ref = influencer.faceReferences[i];
            if (ref.startsWith('data:image')) {
                console.log(`  - Uploading face reference ${i + 1}...`);
                const mimeType = ref.match(/data:(.*?);/)?.[1] || 'image/jpeg';
                const base64Data = ref.split(',')[1];

                const url = await saveGeneratedImage(
                    base64Data,
                    mimeType,
                    influencer.id,
                    `face-ref-${i}`
                );

                if (url) {
                    newFaceRefs.push(url);
                    faceChanged = true;
                } else {
                    newFaceRefs.push(ref);
                }
            } else {
                newFaceRefs.push(ref);
            }
        }

        // 2. Fix roomReferences
        const newRoomRefs = [];
        let roomChanged = false;

        for (let i = 0; i < influencer.roomReferences.length; i++) {
            const ref = influencer.roomReferences[i];
            if (ref.startsWith('data:image')) {
                console.log(`  - Uploading room reference ${i + 1}...`);
                const mimeType = ref.match(/data:(.*?);/)?.[1] || 'image/jpeg';
                const base64Data = ref.split(',')[1];

                const url = await saveGeneratedImage(
                    base64Data,
                    mimeType,
                    influencer.id,
                    `room-ref-${i}`
                );

                if (url) {
                    newRoomRefs.push(url);
                    roomChanged = true;
                } else {
                    newRoomRefs.push(ref);
                }
            } else {
                newRoomRefs.push(ref);
            }
        }

        if (faceChanged || roomChanged) {
            await prisma.influencer.update({
                where: { id: influencer.id },
                data: {
                    faceReferences: newFaceRefs,
                    roomReferences: newRoomRefs,
                } as any
            });
            console.log(`  ✅ Updated ${influencer.name} with clean URLs.`);
        } else {
            console.log(`  ✨ No Base64 images found for ${influencer.name}.`);
        }
    }

    console.log('\n✨ Cleanup completed!');
}

fixInfluencerImages()
    .catch(err => {
        console.error('Cleanup failed:', err);
        process.exit(1);
    });
