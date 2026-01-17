import { config } from 'dotenv';
config({ path: '.env.local' });
import { prisma } from '../src/lib/db';

async function main() {
    console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    try {
        // @ts-ignore
        console.log('Persona property:', !!prisma.persona);
        // @ts-ignore
        console.log('Influencer property:', !!prisma.influencer);
    } catch (e) {
        console.log('Error checking properties');
    }
}

main().catch(console.error);
