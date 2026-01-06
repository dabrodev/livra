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

// Daily outfit that persists through the day
interface DailyOutfit {
    top: string           // e.g., "white oversized sweater"
    bottom: string        // e.g., "black leggings"
    footwear: string      // e.g., "white sneakers"
    accessories: string   // e.g., "gold necklace, small earrings"
    tightsColor: string | null  // e.g., "sheer nude" or null if not wearing
    outerwear: string | null    // e.g., "beige trench coat" for outdoor
}

// Activity status types for real-time tracking
type ActivityStatus = 'sleeping' | 'planning' | 'creating' | 'active' | 'resting';

// Helper to update activity status in real-time
async function updateActivityStatus(
    influencerId: string,
    activity: ActivityStatus,
    details?: string
) {
    await prisma.influencer.update({
        where: { id: influencerId },
        data: {
            currentActivity: activity,
            activityDetails: details || null,
            activityStartedAt: new Date(),
        },
    });
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
    'Krakow': 'Europe/Warsaw',
    'Kraków': 'Europe/Warsaw',
    'Cracow': 'Europe/Warsaw',
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
    {
        id: 'lifecycle-cycle',
        cancelOn: [
            {
                event: 'livra/cycle.stop',
                match: 'data.influencerId',
            }
        ]
    },
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

            // Update activity status: SLEEPING
            await step.run('update-status-sleeping', async () => {
                await updateActivityStatus(influencerId, 'sleeping', `Sleeping until morning (${influencer.city} local time)`);
            });

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

        // Update activity status: PLANNING
        await step.run('update-status-planning', async () => {
            await updateActivityStatus(influencerId, 'planning', 'Checking environment and planning next activity...');
        });

        // Step 1: Environmental Check - use utility functions directly
        const environment = await step.run('check-environment', async (): Promise<EnvironmentContext> => {
            const weather = await getWeather(influencer.city)
            const trends = await getTrends('lifestyle')
            return { weather, trends }
        })

        // Step 1.5: Daily Outfit Selection (once per day, persists until next morning)
        const getTimeOfDay = (hour: number): string => {
            if (hour >= 5 && hour < 12) return 'morning';
            if (hour >= 12 && hour < 17) return 'afternoon';
            return 'evening';
        };
        const currentTimeOfDay = getTimeOfDay(localHour);

        // Check if we need a new outfit (first activity of the day or no outfit set)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const needsNewOutfit = !influencer.dailyOutfit ||
            !influencer.dailyOutfitDate ||
            new Date(influencer.dailyOutfitDate) < today;

        const dailyOutfit = await step.run('get-or-create-daily-outfit', async (): Promise<DailyOutfit> => {
            if (!needsNewOutfit && influencer.dailyOutfit) {
                console.log(`[Lifecycle] ${influencer.name} using existing daily outfit`);
                return influencer.dailyOutfit as unknown as DailyOutfit;
            }

            console.log(`[Lifecycle] ${influencer.name} selecting new daily outfit`);

            // Helper for random selection
            const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

            // Colors and Materials Arrays
            const colors = {
                neutral: ['black', 'white', 'grey', 'beige', 'cream', 'navy', 'camel'],
                pastel: ['soft pink', 'baby blue', 'mint green', 'lavender', 'pale yellow'],
                bold: ['emerald green', 'royal blue', 'ruby red', 'mustard yellow', 'deep purple'],
                earth: ['olive green', 'terracotta', 'rust', 'chocolate brown', 'sage'],
            };
            const allColors = [...colors.neutral, ...colors.pastel, ...colors.bold, ...colors.earth];

            const materials = {
                knit: ['cashmere', 'wool', 'chunky knit', 'ribbed'],
                top: ['silk', 'cotton', 'linen', 'satin'],
                bottom: ['denim', 'leather', 'suede', 'corduroy'],
                coat: ['wool', 'trench', 'faux fur', 'puffer'],
            };

            // Enhanced Tights Logic
            const tightsColors = ['black', 'nude', 'sheer nude', 'white', 'gray', 'navy'];
            // Signature items overrides
            const hasTights = influencer.signatureItems.includes('tights');
            const tightsColor = hasTights ? pick(tightsColors) : null;

            // Generate Top
            const topsByStyle: Record<string, string[]> = {
                'casual': ['sweater', 'cardigan', 't-shirt', 'blouse'],
                'sporty': ['tank top', 'zip-up', 'hoodie', 'sports tee'],
                'elegant': ['blouse', 'turtleneck', 'sweater', 'shirt'],
                'streetwear': ['hoodie', 'sweatshirt', 'crop top', 'graphic tee'],
                'bohemian': ['blouse', 'tunic', 'top', 'kimono'],
            };
            const styleTops = topsByStyle[influencer.clothingStyle] || topsByStyle['casual'];
            const topItem = pick(styleTops);

            // Randomize top details
            let topMaterial = pick(materials.top);
            let topColor = pick(allColors);
            if (topItem.includes('sweater') || topItem.includes('cardigan') || topItem.includes('knits')) {
                topMaterial = pick(materials.knit);
                topColor = pick([...colors.neutral, ...colors.earth, ...colors.pastel]);
            }
            const top = `${topColor} ${topMaterial} ${topItem}`;

            // Generate Bottom with Valid Lengths
            const bottomItem = influencer.bottomwear.length > 0
                ? pick(influencer.bottomwear)
                : 'jeans';

            let bottomDesc = bottomItem;
            if (bottomItem === 'jeans') {
                const jeansLength = pick(['full-length', 'ankle-length']);
                bottomDesc = `${jeansLength} ${pick(['light wash', 'dark wash', 'black', 'white'])} denim jeans`;
            } else if (bottomItem === 'skirts') {
                bottomDesc = `${pick(allColors)} ${pick(['mini', 'midi', 'maxi'])} ${pick(['pleated', 'pencil', 'a-line'])} skirt`;
            } else if (bottomItem === 'leggings') {
                bottomDesc = `full-length ${pick(['black', 'navy', 'grey'])} leggings`;
            } else if (bottomItem.includes('shorts')) {
                bottomDesc = `${pick(allColors)} ${bottomItem}`;
            } else {
                // Default fallback for other pants/trousers
                bottomDesc = `full-length ${pick(allColors)} ${bottomItem}`;
            }

            // Generate Footwear
            const outdoorFootwear = influencer.footwear.filter(f => f !== 'barefoot' && f !== 'slippers');
            const defaultFootwear = ['boots', 'heels', 'sneakers'];

            // If influencer has no outdoor shoes defined, pick from the default set
            const footwearItem = outdoorFootwear.length > 0
                ? pick(outdoorFootwear)
                : pick(defaultFootwear);

            let footwearDesc = footwearItem;
            if (footwearItem.includes('heels')) {
                footwearDesc = `${pick(['black', 'nude', 'red', 'gold', 'silver'])} ${pick(['stiletto', 'block'])} heels`;
            } else if (footwearItem.includes('boots')) {
                footwearDesc = `${pick(['black', 'brown', 'cream'])} leather ${pick(['ankle', 'knee-high'])} boots`;
            } else if (footwearItem.includes('sneakers')) {
                footwearDesc = `${pick(['white', 'colorful', 'chunky'])} sneakers`;
            }

            // Generate Outerwear
            let outerwear: string | null = null;
            if (environment.weather.temp < 15) {
                if (environment.weather.temp < 5) {
                    outerwear = `${pick(['black', 'camel', 'grey', 'cream'])} ${pick(['wool coat', 'puffer jacket', 'faux fur coat'])}`;
                } else {
                    outerwear = `${pick(['beige', 'black', 'sage'])} ${pick(['trench coat', 'leather jacket', 'denim jacket'])}`;
                }
            }

            // Accessories based on signature items
            const accessories = influencer.signatureItems
                .filter(s => s !== 'tights')
                .map(s => {
                    const accessoryMap: Record<string, string[]> = {
                        'jewelry': ['delicate gold necklace', 'silver hoop earrings', 'layered gold chains', 'pearl earrings'],
                        'sunglasses': ['oversized sunglasses', 'aviator sunglasses', 'cat-eye sunglasses'],
                        'hats': ['wide-brim hat', 'beanie', 'baseball cap'],
                        'oversized-sweaters': [], // handled in top
                    };
                    return accessoryMap[s] ? pick(accessoryMap[s]) : '';
                })
                .filter(Boolean)
                .join(', ') || 'minimal gold jewelry';

            const newOutfit: DailyOutfit = {
                top,
                bottom: bottomDesc,
                footwear: footwearDesc,
                accessories,
                tightsColor,
                outerwear,
            };

            // Save to database (cast to Prisma-compatible JSON type)
            await prisma.influencer.update({
                where: { id: influencerId },
                data: {
                    dailyOutfit: JSON.parse(JSON.stringify(newOutfit)),
                    dailyOutfitDate: new Date(),
                },
            });

            return newOutfit;
        });

        // Step 2: Daily Plan - Agent decides next activity

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

        // Update activity status: ACTIVE (doing the activity)
        await step.run('update-status-active', async () => {
            const activityDescription = `${plan.activity}${plan.location ? ` at ${plan.location}` : ''}`;
            await updateActivityStatus(influencerId, 'active', activityDescription);
        });

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

            // Update activity status: CREATING
            await updateActivityStatus(influencerId, 'creating', 'Generating content...');

            // Determine context for outfit variations
            const isAtHome = !plan.location ||
                plan.location.toLowerCase().includes('home') ||
                plan.location.toLowerCase().includes('apartment');

            const isWorkout = plan.activity.toLowerCase().includes('yoga') ||
                plan.activity.toLowerCase().includes('gym') ||
                plan.activity.toLowerCase().includes('workout') ||
                plan.activity.toLowerCase().includes('exercise') ||
                plan.activity.toLowerCase().includes('fitness');

            // Build outfit description based on dailyOutfit with contextual variations
            let outfitDescription: string;

            if (isWorkout) {
                // Special workout outfit
                outfitDescription = `wearing athletic workout clothes: fitted sports top, comfortable leggings${dailyOutfit.tightsColor ? `, ${dailyOutfit.tightsColor} athletic tights underneath` : ''}`;
            } else if (plan.timeOfDay === 'evening' && !isAtHome) {
                // EVENING NIGHT OUT OVERRIDE
                // Prevent "Sneakers at the Opera" scenario
                const eveningDresses = ['elegant black evening dress', 'red velvet cocktail dress', 'silk slip dress', 'sequin mini dress', 'off-shoulder evening gown'];
                const eveningTops = ['silk camisole', 'black velvet body', 'elegant satin blouse', 'sequin top'];
                const eveningBottoms = ['leather mini skirt', 'long satin skirt', 'tailored wide-leg trousers'];
                const eveningHeels = ['strappy high heels', 'black stiletto heels', 'silver pumps', 'classic court shoes'];

                const isDress = Math.random() > 0.4; // 60% chance of dress for evening out

                let eveningWear = "";
                if (isDress) {
                    eveningWear = pick(eveningDresses);
                } else {
                    eveningWear = `${pick(eveningTops)} and ${pick(eveningBottoms)}`;
                }

                const eveningShoes = pick(eveningHeels);
                const eveningAccessories = "statement earrings, evening clutch bag";
                const eveningTights = dailyOutfit.tightsColor ? `sheer ${dailyOutfit.tightsColor} tights` : 'sheer black pantyhose';

                // Coat logic (keep warm if winter)
                const eveningCoat = dailyOutfit.outerwear ? `, wearing ${dailyOutfit.outerwear} over shoulders` : '';

                outfitDescription = `wearing elegant evening attire: ${eveningWear}, ${eveningTights}, ${eveningShoes}, ${eveningAccessories}${eveningCoat}`;

            } else {
                // Regular daily outfit with context variations
                const topDesc = dailyOutfit.top;
                const bottomDesc = dailyOutfit.bottom;

                // Footwear varies by context
                let footwearDesc: string;
                if (isAtHome) {
                    // At home: barefoot or slippers
                    const homeFootwear = influencer.footwear.find(f => f === 'barefoot' || f === 'slippers');
                    if (homeFootwear === 'barefoot') {
                        footwearDesc = 'barefoot with no shoes, bare feet visible';
                    } else {
                        footwearDesc = 'wearing cozy indoor slippers';
                    }
                } else {
                    footwearDesc = `wearing ${dailyOutfit.footwear}`;
                }

                // Tights with reinforced toe if barefoot
                let tightsDesc = '';
                if (dailyOutfit.tightsColor) {
                    const isBarefootOrSlippers = isAtHome && influencer.footwear.some(f => f === 'barefoot' || f === 'slippers');
                    if (isBarefootOrSlippers) {
                        tightsDesc = `MUST be wearing ${dailyOutfit.tightsColor} sheer tights on legs and feet, with reinforced toes (slightly thicker fabric at the toes but still sheer, toes visible through)`;
                    } else {
                        tightsDesc = `MUST be wearing ${dailyOutfit.tightsColor} sheer tights on legs`;
                    }
                }

                // Outerwear only outdoors
                const outerwearDesc = !isAtHome && dailyOutfit.outerwear
                    ? `, with ${dailyOutfit.outerwear}`
                    : '';

                outfitDescription = [
                    `wearing ${topDesc}`,
                    bottomDesc,
                    footwearDesc,
                    tightsDesc,
                    dailyOutfit.accessories,
                    outerwearDesc
                ].filter(Boolean).join(', ');
            }

            // Generate lighting description based on time of day
            const lightingByTime: Record<string, string> = {
                morning: 'soft morning sunlight, golden hour glow',
                afternoon: 'bright natural daylight, clear sky',
                evening: 'warm evening lighting, dim ambient light, night time atmosphere, dark outside'
            };
            const lightingDescription = lightingByTime[currentTimeOfDay] || lightingByTime.evening;

            // Get current month and season for context
            const now = new Date();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const currentMonth = monthNames[now.getMonth()];

            // Determine season (Northern Hemisphere - most cities are there)
            const month = now.getMonth();
            let season = 'spring';
            if (month >= 11 || month <= 1) season = 'winter';
            else if (month >= 2 && month <= 4) season = 'spring';
            else if (month >= 5 && month <= 7) season = 'summer';
            else season = 'autumn';

            const imagePrompt = `A beautiful, Instagram-worthy photo of a ${influencer.personalityVibe} influencer ${plan.activity} at ${plan.location || 'home'}. 
TIME: ${currentMonth} ${season}, ${localHour}:00 local time (${plan.timeOfDay}) - LIGHTING: ${lightingDescription}.
Weather: ${environment.weather.condition}, ${environment.weather.temp}°C - ${environment.weather.description}.
Style: authentic lifestyle photography.
OUTFIT (consistent daily look): ${outfitDescription}.
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

                // Weather emoji
                const weatherEmoji: Record<string, string> = {
                    sunny: '☀️',
                    cloudy: '☁️',
                    rainy: '🌧️',
                    snowy: '❄️',
                };
                const emoji = weatherEmoji[environment.weather.condition] || '🌤️';

                const caption = `${plan.activity} ${emoji} ${environment.weather.temp}°C in ${influencer.city} ✨ ${timeHashtags[currentTimeOfDay] || '#lifestyle'}`

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
                        prompt: imagePrompt,
                    },
                })

                return {
                    postId: post.id,
                    contentUrl: imageUrl,
                    caption: post.caption,
                    description: result.description,
                }
            } else {
                // Throw error to trigger Inngest retry
                console.error('Image generation failed, will retry:', result.error)
                throw new Error(`Image generation failed: ${result.error}`)
            }
        })

        // Step 6: Daytime Rest (Siesta / Break)
        // Since we are in day mode, we just take a short break between activities (2-4 hours)
        const randomHours = Math.floor(Math.random() * 3) + 3; // 3-5 hours between activities
        const sleepDuration = `${randomHours}h`;

        console.log(`[Lifecycle] ${influencer.name} completed activity. Taking a break for ${sleepDuration}.`);

        // Update activity status: RESTING
        await step.run('update-status-resting', async () => {
            await updateActivityStatus(influencerId, 'resting', `Taking a ${randomHours}-hour break`);
        });

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
