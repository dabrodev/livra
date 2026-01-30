import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    const { prisma } = await import('../src/lib/db');
    console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    try {
        // @ts-ignore
        console.log('Persona property:', !!prisma.persona);
    } catch (e) {
        console.log('Error checking properties');
    }
}

main().catch(console.error);
