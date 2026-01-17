
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Read .env specifically (ignoring .env.local)
const envPath = path.resolve(__dirname, '../.env')
const envConfig = fs.readFileSync(envPath, 'utf8')
let dbUrl = ''

envConfig.split('\n').forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
        dbUrl = line.split('DATABASE_URL=')[1].replace(/"/g, '').trim()
    }
})

console.log('Checking database at:', dbUrl.substring(0, 30) + '...')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
})

async function main() {
    try {
        const userCount = await prisma.user.count()
        const infCount = await prisma.influencer.count()
        console.log(`\nFOUND DATA:`)
        console.log(`- Users: ${userCount}`)
        console.log(`- Influencers: ${infCount}`)

        if (infCount > 0) {
            console.log('\n!!! DATA FOUND !!!')
            const influencers = await prisma.influencer.findMany()
            console.log('Sample names:', influencers.map(i => i.name).join(', '))
        } else {
            console.log('\nNo data found in this DB either.')
        }
    } catch (e) {
        console.error('Error querying this DB:', e.message)
        // Maybe schema mismatch? Try raw query if possible, but count() usually works if table exists
    } finally {
        await prisma.$disconnect()
    }
}

main()
