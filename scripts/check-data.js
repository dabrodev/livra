
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    const influencers = await prisma.influencer.findMany()

    console.log('--- USERS ---')
    console.log(JSON.stringify(users, null, 2))
    console.log('\n--- INFLUENCERS ---')
    console.log(JSON.stringify(influencers, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
