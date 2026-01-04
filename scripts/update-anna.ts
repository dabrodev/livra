import { prisma } from '../src/lib/db';

async function updateAnna() {
    const result = await prisma.influencer.update({
        where: { id: '10e2c38c-19fb-497d-bd17-e82f4fa66c25' },
        data: {
            footwear: ['barefoot'],
            signatureItems: ['tights'],
            bottomwear: ['leggings', 'dresses'],
        },
    });

    console.log('Updated Anna:', {
        name: result.name,
        footwear: result.footwear,
        signatureItems: result.signatureItems,
        bottomwear: result.bottomwear,
    });

    await prisma.$disconnect();
}

updateAnna().catch(console.error);
