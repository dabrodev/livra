
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Get the first user (should be the one you just created/logged in with)
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found! Please log in to the app first to create a user record.')
        return
    }

    console.log(`Seeding data for user: ${user.email} (${user.id})`)

    const personas = [
        {
            name: "Sofia Chen",
            country: "France",
            city: "Paris",
            neighborhood: "Le Marais",
            apartmentStyle: "Haussmannian Chic",
            personalityVibe: "Artistic dreamer with a tech edge",
            gender: "female",
            hairColor: "black",
            hairStyle: "bob",
            eyeColor: "brown",
            skinTone: "light",
            clothingStyle: "minimalist elegance",
            currentActivity: "planning",
            lifecycleStatus: "paused",
            userId: user.id
        },
        {
            name: "Marcus Aurelius",
            country: "Italy",
            city: "Rome",
            neighborhood: "Trastevere",
            apartmentStyle: "Modern rustic",
            personalityVibe: "Stoic philosopher influencer",
            gender: "male",
            hairColor: "brown",
            hairStyle: "short",
            facialHair: "beard",
            eyeColor: "green",
            skinTone: "tan",
            clothingStyle: "smart casual",
            currentActivity: "reading",
            lifecycleStatus: "paused",
            userId: user.id
        },
        {
            name: "Aiko Tanaka",
            country: "Japan",
            city: "Tokyo",
            neighborhood: "Shimokitazawa",
            apartmentStyle: "Compact minimalist",
            personalityVibe: "Vintage fashion hunter",
            gender: "female",
            hairColor: "pink",
            hairStyle: "long wavy",
            eyeColor: "hazel",
            skinTone: "light",
            clothingStyle: "streetwear vintage",
            currentActivity: "shopping",
            lifecycleStatus: "paused",
            userId: user.id
        }
    ]

    for (const persona of personas) {
        await prisma.persona.create({
            data: persona
        })
        console.log(`Created persona: ${persona.name}`)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
