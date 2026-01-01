import { inngest } from '../client'
import { prisma } from '@/lib/db'
import { lifeDirectorAgent, getWeather, getTrends, type WeatherResult, type TrendsResult } from '@/mastra'
import { generateInfluencerImage, saveGeneratedImage } from '@/lib/image-generation'

// Types for better structure
interface ActivityPlan {
    activity: string
    timeOfDay: string
    location: string | null
    isContentWorthy: boolean
    estimatedCost: number
    moodImpact: string
}

interface EnvironmentContext {
    weather: WeatherResult
    trends: TrendsResult
}

export const lifecycleCycle = inngest.createFunction(
    { id: 'lifecycle-cycle' },
    { event: 'livra/cycle.start' },
    async ({ event, step }) => {
        const influencerId = event.data.influencerId as string

        // Get the influencer data
        const influencer = await step.run('fetch-influencer', async () => {
            const data = await prisma.influencer.findUnique({
                where: { id: influencerId },
                include: {
                    memories: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            })
            if (!data) throw new Error(`Influencer ${influencerId} not found`)
            return data
        })

        // Step 1: Environmental Check - use utility functions directly
        const environment = await step.run('check-environment', async (): Promise<EnvironmentContext> => {
            const weather = await getWeather(influencer.city)
            const trends = await getTrends('lifestyle')
            return { weather, trends }
        })

        // Step 2: Daily Plan - Agent decides next activity
        const plan = await step.run('create-daily-plan', async (): Promise<ActivityPlan> => {
            const recentMemories = influencer.memories
                .map((m: { description: string }) => m.description)
                .join(', ')

            const prompt = `
You are planning the next activity for ${influencer.name}, a ${influencer.personalityVibe} influencer living in ${influencer.city}.

Current context:
- Weather: ${environment.weather.condition}, ${environment.weather.temp}°C - ${environment.weather.description}
- Trending: ${environment.trends.trends.slice(0, 3).join(', ')}
- Current balance: $${influencer.currentBalance}
- Recent activities: ${recentMemories || 'Just starting their day'}
- Apartment style: ${influencer.apartmentStyle}
- Clothing style: ${influencer.clothingStyle}

Based on this context, plan the next activity. Consider:
1. The weather conditions
2. Their budget
3. Their personality vibe
4. Whether this would be good content

Respond with a JSON object containing:
{
    "activity": "activity name",
    "timeOfDay": "morning|afternoon|evening",
    "location": "location name or null",
    "isContentWorthy": true or false,
    "estimatedCost": number,
    "moodImpact": "positive|neutral|negative"
}
`

            try {
                const result = await lifeDirectorAgent.generate(prompt, {
                    maxSteps: 3,
                })

                // Try to parse structured response from agent
                const text = result.text || ''
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0])
                    return {
                        activity: parsed.activity || 'Morning Routine',
                        timeOfDay: parsed.timeOfDay || 'morning',
                        location: parsed.location || null,
                        isContentWorthy: parsed.isContentWorthy ?? true,
                        estimatedCost: parsed.estimatedCost || 0,
                        moodImpact: parsed.moodImpact || 'positive',
                    }
                }
            } catch (error) {
                console.error('Failed to parse agent response:', error)
            }

            // Default fallback
            return {
                activity: 'Morning Coffee Run',
                timeOfDay: 'morning',
                location: 'Local Café',
                isContentWorthy: true,
                estimatedCost: 8,
                moodImpact: 'positive',
            }
        })

        // Step 3: Create memory of the activity
        const memory = await step.run('create-memory', async () => {
            return await prisma.memory.create({
                data: {
                    influencerId,
                    description: `${plan.activity} at ${plan.location || 'home'} - ${plan.moodImpact} vibes`,
                    importance: plan.isContentWorthy ? 4 : 2,
                },
            })
        })

        // Step 4: Update wallet if there was spending
        if (plan.estimatedCost > 0) {
            await step.run('update-wallet', async () => {
                return await prisma.influencer.update({
                    where: { id: influencerId },
                    data: {
                        currentBalance: {
                            decrement: plan.estimatedCost,
                        },
                    },
                })
            })
        }

        // Step 5: Production (Image) - Using Gemini 3 Pro Image (Nano Banana Pro)
        const image = await step.run('produce-image', async () => {
            if (!plan.isContentWorthy) {
                return null
            }

            // Build image generation prompt based on activity
            const imagePrompt = `A beautiful, Instagram-worthy photo of a ${influencer.personalityVibe} influencer ${plan.activity} at ${plan.location || 'home'}. 
The scene is ${plan.timeOfDay}, with ${environment.weather.condition} weather.
Style: authentic lifestyle photography, natural lighting, warm tones.
Clothing style: ${influencer.clothingStyle}.
Location: ${influencer.city}, in a ${influencer.apartmentStyle} setting.`

            // Generate image with face and room references
            const result = await generateInfluencerImage(
                imagePrompt,
                influencer.faceReferences,
                influencer.roomReferences,
                {
                    aspectRatio: '4:5', // Instagram portrait
                    resolution: '2K',
                }
            )

            if (result.success && result.imageBase64) {
                // Create post with generated image
                const caption = `${plan.activity} ✨ #${influencer.city.toLowerCase().replace(/\s/g, '')} ${environment.trends.trends.slice(0, 2).join(' ')}`

                // Save image (returns data URL for now, TODO: upload to Supabase Storage)
                const imageUrl = await saveGeneratedImage(
                    result.imageBase64,
                    result.mimeType || 'image/png',
                    influencerId,
                    'pending'
                )

                const post = await prisma.post.create({
                    data: {
                        influencerId,
                        type: 'IMAGE',
                        contentUrl: imageUrl || '',
                        caption,
                    },
                })

                return {
                    postId: post.id,
                    contentUrl: imageUrl,
                    caption: post.caption,
                    description: result.description,
                }
            } else {
                console.error('Image generation failed:', result.error)
                // Create post without image (placeholder)
                const post = await prisma.post.create({
                    data: {
                        influencerId,
                        type: 'IMAGE',
                        contentUrl: '',
                        caption: `${plan.activity} ✨ #${influencer.city.toLowerCase().replace(/\s/g, '')}`,
                    },
                })
                return { postId: post.id, contentUrl: '', caption: post.caption, error: result.error }
            }
        })

        // Step 6: Sleep 4-8 hours (randomized for natural feel)
        const sleepHours = Math.floor(Math.random() * 5) + 4 // 4-8 hours
        await step.sleep('wait-for-next-cycle', `${sleepHours}h`)

        // Step 7: Production (Video) - Placeholder for Veo 3.1 integration
        const video = await step.run('produce-video', async () => {
            // TODO: Integrate with Veo 3.1 API
            // 1. Generate First Frame (Nano Banana Pro)
            // 2. Generate Last Frame (Nano Banana Pro) using First Frame as reference
            // 3. Call Veo 3.1 for interpolation
            // 4. Save to Post table

            return null
        })

        // Trigger next cycle to keep the autonomous loop going
        await step.sendEvent('trigger-next-cycle', {
            name: 'livra/cycle.start',
            data: { influencerId },
        })

        return {
            influencer: influencer.name,
            environment,
            plan,
            memory: memory.id,
            image,
            video,
            nextCycleIn: `${sleepHours} hours`,
        }
    }
)

// Function to start the lifecycle for a new influencer
export const startLifecycle = inngest.createFunction(
    { id: 'start-lifecycle' },
    { event: 'livra/influencer.created' },
    async ({ event, step }) => {
        const influencerId = event.data.influencerId as string

        // Create initial memory
        await step.run('create-initial-memory', async () => {
            return await prisma.memory.create({
                data: {
                    influencerId,
                    description: 'Started a new chapter in life - feeling excited about the journey ahead!',
                    importance: 5,
                },
            })
        })

        // Trigger the first lifecycle cycle
        await step.sendEvent('trigger-first-cycle', {
            name: 'livra/cycle.start',
            data: { influencerId },
        })

        return { started: true, influencerId }
    }
)

export const functions = [lifecycleCycle, startLifecycle]
