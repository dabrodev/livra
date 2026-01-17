
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    const personas = await prisma.persona.findMany()

    console.log('--- USERS ---')
    console.log(JSON.stringify(users, null, 2))
    console.log('\n--- PERSONAS ---')
    console.log(JSON.stringify(personas, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
