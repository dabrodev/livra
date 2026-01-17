
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
try {
    const envPath = path.resolve(__dirname, '../.env.local')
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
} catch (e) {
    console.log('No .env.local found or error reading it')
}

// Fallback to DATABASE_URL if in process.env
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL
}

console.log('Connecting to:', process.env.DATABASE_URL ? 'Database URL found' : 'No Database URL')

const client = new Client({
    connectionString: process.env.DATABASE_URL,
})

async function main() {
    await client.connect()
    const resUsers = await client.query('SELECT * FROM "User"')
    const resInfluencers = await client.query('SELECT * FROM "Influencer"')

    console.log('--- USERS ---')
    console.log(resUsers.rows)
    console.log('\n--- INFLUENCERS ---')
    console.log(resInfluencers.rows)

    await client.end()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
