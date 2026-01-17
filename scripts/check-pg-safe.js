
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

console.log('Connecting to DB...')

const client = new Client({
    connectionString: process.env.DATABASE_URL,
})

async function main() {
    await client.connect()
    const resUsers = await client.query('SELECT count(*) FROM "User"')
    const resInfluencers = await client.query('SELECT count(*) FROM "Influencer"')

    console.log('User count:', resUsers.rows[0].count)
    console.log('Influencer count:', resInfluencers.rows[0].count)

    await client.end()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
