
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to DB from .env (not local)...')

    try {
        const count = await prisma.influencer.count()
        console.log(`Influencer count: ${count}`)

        if (count > 0) {
            const influencers = await prisma.influencer.findMany({ take: 5 })
            console.log('Sample data found:', influencers.map(i => i.name))
        }
    } catch (e) {
        console.error('Error querying Influencer table:', e.message)
    }

    try {
        const userCount = await prisma.user.count()
        console.log(`User count: ${userCount}`)
    } catch (e) {
        console.log('User table likely does not exist (expected for old DB).')
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
