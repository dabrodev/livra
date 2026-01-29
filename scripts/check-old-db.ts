
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to DB from .env (not local)...')

    try {
        const count = await prisma.persona.count()
        console.log(`Persona count: ${count}`)

        if (count > 0) {
            const personas = await prisma.persona.findMany({ take: 5 })
            console.log('Sample data found:', personas.map(i => i.name))
        }
    } catch (e: any) {
        console.error('Error querying Persona table:', e.message)
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
