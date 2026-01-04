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

// Simple mapping for demo purposes. Ideally this comes from the DB or an external API.
const TIMEZONE_MAP: Record<string, string> = {
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles',
    'London': 'Europe/London',
    'Berlin': 'Europe/Berlin',
    'Paris': 'Europe/Paris',
    'Dubai': 'Asia/Dubai',
    'Tokyo': 'Asia/Tokyo',
    'Mumbai': 'Asia/Kolkata',
    'Sydney': 'Australia/Sydney',
    'São Paulo': 'America/Sao_Paulo',
    'Lagos': 'Africa/Lagos',
    'Stockholm': 'Europe/Stockholm',
    'Warsaw': 'Europe/Warsaw',
}

function getLocalHour(city: string): number {
    const timeZone = TIMEZONE_MAP[city] || 'UTC';
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone
        });
        return parseInt(formatter.format(date), 10);
    } catch (e) {
        console.warn(`Invalid timezone for city ${city}, defaulting to UTC`);
        return new Date().getUTCHours();
    }
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

        // Check if lifecycle is active
        if (!(influencer as any).isActive) {
            console.log(`Lifecycle for ${influencer.name} is paused.`)
            return { paused: true, influencer: influencer.name }
        }

        // --- TIMEZONE & SLEEP LOGIC START ---
        const localHour = getLocalHour(influencer.city);
        const isNight = localHour >= 23 || localHour < 7;

        if (isNight) {
            // Night Mode: Sleep until approx 7 AM
            const hoursUntilMorning = localHour >= 23
                ? (24 - localHour) + 7
                : 7 - localHour;

            const randomOffset = Math.floor(Math.random() * 60); // 0-60 mins jitter
            const sleepMinutes = (hoursUntilMorning * 60) + randomOffset;
            const sleepDuration = `${sleepMinutes}m`;

            console.log(`[Lifecycle] ${influencer.name} in ${influencer.city} (Local: ${localHour}:00). Night mode activated. Sleeping for ${sleepDuration}.`);

            // Sleep
            await step.sleep('wait-for-morning', sleepDuration);

            // Trigger next cycle
            await step.sendEvent('trigger-morning-cycle', {
                name: 'livra/cycle.start',
                data: { influencerId },
            })

            return {
                status: 'sleeping',
                message: 'Goodnight! See you in the morning.',
                nextCycleIn: sleepDuration,
                localTime: `${localHour}:00`
            }
        }
        // --- TIMEZONE & SLEEP LOGIC END ---

        // If we are here, it is DAYTIME. Proceed with Action Loop.

        // Step 1: Environmental Check - use utility functions directly
        const environment = await step.run('check-environment', async (): Promise<EnvironmentContext> => {
            const weather = await getWeather(influencer.city)
            const trends = await getTrends('lifestyle')
            return { weather, trends }
        })

        // Step 2: Daily Plan - Agent decides next activity
        // Determine time of day based on local hour
        const getTimeOfDay = (hour: number): string => {
            if (hour >= 5 && hour < 12) return 'morning';
            if (hour >= 12 && hour < 17) return 'afternoon';
            return 'evening';
        };
        const currentTimeOfDay = getTimeOfDay(localHour);

        const plan = await step.run('create-daily-plan', async (): Promise<ActivityPlan> => {
            const recentMemories = influencer.memories
                .map((m: { description: string }) => m.description)
                .join(', ')

            const prompt = `
You are planning the next activity for ${influencer.name}, a ${influencer.personalityVibe} influencer living in ${influencer.city}.

Current context:
- LOCAL TIME: ${localHour}:00 (${currentTimeOfDay}) - THIS IS CRITICAL, plan activities appropriate for this time!
- Weather: ${environment.weather.condition}, ${environment.weather.temp}°C - ${environment.weather.description}
- Trending: ${environment.trends.trends.slice(0, 3).join(', ')}
- Current balance: $${influencer.currentBalance}
- Recent activities: ${recentMemories || 'Just starting their day'}
- Apartment style: ${influencer.apartmentStyle}
- Clothing style: ${influencer.clothingStyle}

Based on this context, plan the next activity. Consider:
1. THE TIME OF DAY - Do not plan morning activities in the evening!
2. The weather conditions
3. Their budget
4. Their personality vibe
5. Whether this would be good content

Respond with a JSON object containing:
{
    "activity": "activity name appropriate for ${currentTimeOfDay}",
    "timeOfDay": "${currentTimeOfDay}",
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
                        activity: parsed.activity || `${currentTimeOfDay.charAt(0).toUpperCase() + currentTimeOfDay.slice(1)} Activity`,
                        timeOfDay: parsed.timeOfDay || currentTimeOfDay,
                        location: parsed.location || null,
                        isContentWorthy: parsed.isContentWorthy ?? true,
                        estimatedCost: parsed.estimatedCost || 0,
                        moodImpact: parsed.moodImpact || 'positive',
                    }
                }
            } catch (error) {
                console.error('Failed to parse agent response:', error)
            }

            // Dynamic fallback based on actual time of day
            const fallbackActivities: Record<string, { activity: string; location: string }> = {
                morning: { activity: 'Morning Coffee Run', location: 'Local Café' },
                afternoon: { activity: 'Exploring the neighborhood', location: 'City Center' },
                evening: { activity: 'Dinner at a trendy restaurant', location: 'Downtown' },
            };
            const fallback = fallbackActivities[currentTimeOfDay] || fallbackActivities.evening;

            return {
                activity: fallback.activity,
                timeOfDay: currentTimeOfDay,
                location: fallback.location,
                isContentWorthy: true,
                estimatedCost: currentTimeOfDay === 'evening' ? 45 : 12,
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

            // Dynamic mappings for stronger AI instructions
            const footwearDescriptions: Record<string, string> = {
                'barefoot': 'barefoot with no shoes or socks, bare feet visible',
                'sneakers': 'wearing casual sneakers',
                'heels': 'wearing elegant high heels',
                'boots': 'wearing stylish boots',
                'sandals': 'wearing open sandals',
                'slippers': 'wearing cozy indoor slippers',
            };

            // Random tights color for variety
            const tightsColors = ['black', 'nude', 'sheer nude', 'white', 'gray', 'navy'];
            const randomTightsColor = tightsColors[Math.floor(Math.random() * tightsColors.length)];

            const signatureDescriptions: Record<string, string> = {
                'tights': `MUST be wearing ${randomTightsColor} sheer tights on legs - this is a signature style element`,
                'oversized-sweaters': 'wearing an oversized cozy sweater',
                'jewelry': 'wearing statement jewelry pieces',
                'sunglasses': 'wearing stylish sunglasses',
                'hats': 'wearing a fashionable hat or cap',
                'layered-looks': 'wearing layered clothing',
                'crop-tops': 'wearing a crop top',
                'maxi-dresses': 'wearing a flowing maxi dress',
            };

            // Build detailed style requirements
            // Determine if activity is indoors/at home
            const isAtHome = !plan.location ||
                plan.location.toLowerCase().includes('home') ||
                plan.location.toLowerCase().includes('apartment');

            // Filter footwear based on context
            const contextualFootwear = influencer.footwear.filter(f => {
                // Barefoot only makes sense at home
                if (f === 'barefoot' && !isAtHome) return false;
                // Slippers only at home
                if (f === 'slippers' && !isAtHome) return false;
                return true;
            });

            // If all footwear was filtered out (e.g., only had barefoot but going outside), use default
            const footwearToUse = contextualFootwear.length > 0
                ? contextualFootwear
                : (isAtHome ? influencer.footwear : ['comfortable shoes']);

            const footwearDetails = footwearToUse
                .map(f => footwearDescriptions[f] || f)
                .join(', ');

            const signatureDetails = influencer.signatureItems
                .map(s => signatureDescriptions[s] || s)
                .join('. ');

            const bottomwearDetails = influencer.bottomwear.length > 0
                ? `wearing ${influencer.bottomwear.join(' or ')}`
                : '';

            // Build comprehensive style section
            const styleRequirements = [
                bottomwearDetails,
                footwearDetails,
                signatureDetails
            ].filter(Boolean).join('. ');

            // Generate lighting description based on time of day
            const lightingByTime: Record<string, string> = {
                morning: 'soft morning sunlight, golden hour glow',
                afternoon: 'bright natural daylight, clear sky',
                evening: 'warm evening lighting, dim ambient light, night time atmosphere, dark outside'
            };
            const lightingDescription = lightingByTime[currentTimeOfDay] || lightingByTime.evening;

            const imagePrompt = `A beautiful, Instagram-worthy photo of a ${influencer.personalityVibe} influencer ${plan.activity} at ${plan.location || 'home'}. 
TIME OF DAY: ${plan.timeOfDay} - LIGHTING: ${lightingDescription}.
Weather: ${environment.weather.condition}.
Style: authentic lifestyle photography.
Clothing style: ${influencer.clothingStyle}.
IMPORTANT CLOTHING REQUIREMENTS: ${styleRequirements || 'casual comfortable attire'}.
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
                // Create post with generated image - use time-appropriate hashtags
                const timeHashtags: Record<string, string> = {
                    morning: '#morningvibes #sunrise',
                    afternoon: '#afternoonmood #lifestyle',
                    evening: '#eveningvibes #nightout #nightlife'
                };
                const caption = `${plan.activity} ✨ #${influencer.city.toLowerCase().replace(/\s/g, '')} ${timeHashtags[currentTimeOfDay] || '#lifestyle'}`

                // Save image to Supabase Storage
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

        // Step 6: Daytime Rest (Siesta / Break)
        // Since we are in day mode, we just take a short break between activities (2-4 hours)
        const randomHours = Math.floor(Math.random() * 3) + 2;
        const sleepDuration = `${randomHours}h`;

        console.log(`[Lifecycle] ${influencer.name} completed activity. Taking a break for ${sleepDuration}.`);
        await step.sleep('wait-for-next-cycle', sleepDuration);

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
            image,
            video,
            nextCycleIn: sleepDuration,
            localTime: `${localHour}:00`
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
