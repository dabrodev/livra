import { inngest } from '../client'
import { prisma } from '@/lib/db'
import { lifeDirectorAgent, getWeather, getTrends, type WeatherResult, type TrendsResult } from '@/mastra'
import { generatePersonaImage, saveGeneratedImage } from '@/lib/image-generation'

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
    weather: WeatherResult | null
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
    isEvening?: boolean   // Flag for evening wear status
}

// Activity status types for real-time tracking
type ActivityStatus = 'sleeping' | 'planning' | 'creating' | 'active' | 'resting';

// Helper to update activity status in real-time
async function updateActivityStatus(
    personaId: string,
    activity: ActivityStatus,
    details?: string
) {
    await prisma.persona.update({
        where: { id: personaId },
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
                match: 'data.personaId',
            }
        ]
    },
    { event: 'livra/cycle.start' },
    async ({ event, step }) => {
        const personaId = event.data.personaId as string

        // Get the persona data
        const persona = await step.run('fetch-persona', async () => {
            const data = await prisma.persona.findUnique({
                where: { id: personaId },
                include: {
                    memories: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            })
            if (!data) throw new Error(`Persona ${personaId} not found`)
            return data
        })

        // Handle Manual Retry from memory
        const retryMemoryId = event.data.retryMemoryId as string | undefined;
        let retryMemory = null;
        if (retryMemoryId) {
            retryMemory = await step.run('fetch-retry-memory', async () => {
                return await prisma.memory.findUnique({
                    where: { id: retryMemoryId }
                });
            });
        }

        // Check if lifecycle is active
        if (!(persona as any).isActive) {
            console.log(`Lifecycle for ${persona.name} is paused.`)
            return { paused: true, persona: persona.name }
        }

        // --- TIMEZONE & SLEEP LOGIC START ---
        const localHour = getLocalHour(persona.city);
        const isNight = localHour >= 23 || localHour < 7;

        if (isNight) {
            // Night Mode: Sleep until approx 7 AM
            const hoursUntilMorning = localHour >= 23
                ? (24 - localHour) + 7
                : 7 - localHour;

            const randomOffset = Math.floor(Math.random() * 60); // 0-60 mins jitter
            const sleepMinutes = (hoursUntilMorning * 60) + randomOffset;
            const sleepDuration = `${sleepMinutes}m`;

            console.log(`[Lifecycle] ${persona.name} in ${persona.city} (Local: ${localHour}:00). Night mode activated. Sleeping for ${sleepDuration}.`);

            // Update activity status: SLEEPING
            await step.run('update-status-sleeping', async () => {
                await updateActivityStatus(personaId, 'sleeping', `Sleeping until morning (${persona.city} local time)`);
            });

            // Sleep
            await step.sleep('wait-for-morning', sleepDuration);

            // Trigger next cycle
            await step.sendEvent('trigger-morning-cycle', {
                name: 'livra/cycle.start',
                data: { personaId },
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
            await updateActivityStatus(personaId, 'planning', 'Checking environment and planning next activity...');
        });

        // Step 1: Environmental Check - use utility functions directly
        const environment = await step.run('check-environment', async (): Promise<EnvironmentContext> => {
            const weather = await getWeather(persona.city)
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

        const needsNewOutfit = !persona.dailyOutfit ||
            !persona.dailyOutfitDate ||
            new Date(persona.dailyOutfitDate) < today;

        const dailyOutfit = await step.run('get-or-create-daily-outfit', async (): Promise<DailyOutfit> => {
            if (!needsNewOutfit && persona.dailyOutfit) {
                console.log(`[Lifecycle] ${persona.name} using existing daily outfit`);
                return persona.dailyOutfit as unknown as DailyOutfit;
            }

            console.log(`[Lifecycle] ${persona.name} selecting new daily outfit`);

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

            const isMale = persona.gender === 'male';

            // Gender-specific logic
            let tightsColor: string | null = null;
            if (!isMale) {
                // Tights only for females
                const tightsColors = ['black', 'nude', 'sheer nude', 'white', 'gray', 'navy'];
                const hasTights = (persona.signatureItems as string[]).includes('tights');
                tightsColor = hasTights ? pick(tightsColors) : null;
            }

            // Generate Top
            const topsByStyle: Record<string, string[]> = isMale ? {
                'casual': ['t-shirt', 'polo shirt', 'henley', 'casual shirt'],
                'sporty': ['tank top', 'athletic shirt', 'hoodie', 'sports tee'],
                'elegant': ['dress shirt', 'button-down', 'sweater', 'blazer'],
                'streetwear': ['hoodie', 'sweatshirt', 'graphic tee', 'oversized tee'],
                'bohemian': ['linen shirt', 'loose shirt', 'tunic', 'casual shirt'],
            } : {
                'casual': ['sweater', 'cardigan', 't-shirt', 'blouse'],
                'sporty': ['tank top', 'zip-up', 'hoodie', 'sports tee'],
                'elegant': ['blouse', 'turtleneck', 'sweater', 'shirt'],
                'streetwear': ['hoodie', 'sweatshirt', 'crop top', 'graphic tee'],
                'bohemian': ['blouse', 'tunic', 'top', 'kimono'],
            };

            const styleTops = topsByStyle[persona.clothingStyle] || topsByStyle['casual'];
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
            const bottomItem = (persona.bottomwear as string[]).length > 0
                ? pick(persona.bottomwear as string[])
                : 'jeans';

            let bottomDesc = bottomItem;
            if (bottomItem === 'jeans') {
                const jeansLength = pick(['full-length', 'ankle-length']);
                bottomDesc = `${jeansLength} ${pick(['light wash', 'dark wash', 'black', 'white'])} denim jeans`;
            } else if (bottomItem === 'chinos') {
                bottomDesc = `${pick(['beige', 'navy', 'khaki', 'grey'])} chinos`;
            } else if (bottomItem === 'joggers') {
                bottomDesc = `${pick(['black', 'grey', 'navy'])} joggers`;
            } else if (bottomItem === 'dress-pants') {
                bottomDesc = `${pick(['black', 'navy', 'charcoal'])} dress pants`;
            } else if (bottomItem === 'skirts') {
                bottomDesc = `${pick(allColors)} ${pick(['mini', 'midi', 'maxi'])} ${pick(['pleated', 'pencil', 'a-line'])} skirt`;
            } else if (bottomItem === 'leggings') {
                bottomDesc = `full-length ${pick(['black', 'navy', 'grey'])} leggings`;
            } else if (bottomItem === 'dresses') {
                bottomDesc = `${pick(allColors)} ${pick(['mini', 'midi', 'maxi'])} dress`;
            } else if (bottomItem.includes('shorts')) {
                bottomDesc = `${pick(allColors)} ${bottomItem}`;
            } else {
                // Default fallback for other pants/trousers
                bottomDesc = `full-length ${pick(allColors)} ${bottomItem}`;
            }

            // Generate Footwear
            const outdoorFootwear = (persona.footwear as string[]).filter((f: string) => f !== 'barefoot' && f !== 'slippers');
            const defaultFootwear = isMale ? ['boots', 'sneakers', 'dress-shoes'] : ['boots', 'heels', 'sneakers'];

            // If persona has no outdoor shoes defined, pick from the default set
            const footwearItem = outdoorFootwear.length > 0
                ? pick(outdoorFootwear)
                : pick(defaultFootwear);

            let footwearDesc = footwearItem;
            if (footwearItem.includes('heels')) {
                footwearDesc = `${pick(['black', 'nude', 'red', 'gold', 'silver'])} ${pick(['stiletto', 'block'])} heels`;
            } else if (footwearItem.includes('dress-shoes')) {
                footwearDesc = `${pick(['black', 'brown', 'oxford'])} dress shoes`;
            } else if (footwearItem.includes('boots')) {
                footwearDesc = `${pick(['black', 'brown', 'cream'])} leather ${pick(['ankle', 'knee-high'])} boots`;
            } else if (footwearItem.includes('sneakers')) {
                footwearDesc = `${pick(['white', 'colorful', 'chunky'])} sneakers`;
            }

            // Generate Outerwear (assume mild weather if unknown)
            let outerwear: string | null = null;
            const temp = environment.weather?.temp ?? 10; // Default to mild if unknown
            if (temp < 15) {
                if (temp < 5) {
                    outerwear = `${pick(['black', 'camel', 'grey', 'cream'])} ${pick(['wool coat', 'puffer jacket', 'faux fur coat'])}`;
                } else {
                    outerwear = `${pick(['beige', 'black', 'sage'])} ${pick(['trench coat', 'leather jacket', 'denim jacket'])}`;
                }
            }

            // Accessories based on signature items
            const accessoryMap: Record<string, string[]> = isMale ? {
                'watches': ['silver watch', 'leather strap watch', 'smart watch', 'gold watch'],
                'jewelry': ['silver chain', 'leather bracelet', 'ring'],
                'sunglasses': ['aviator sunglasses', 'wayfarer sunglasses', 'sport sunglasses'],
                'hats': ['baseball cap', 'beanie', 'fedora'],
                'oversized-hoodies': [], // handled in top
                'leather-jackets': [], // handled in outerwear
                'ties': ['silk tie', 'bow tie', 'knit tie'],
            } : {
                'jewelry': ['delicate gold necklace', 'silver hoop earrings', 'layered gold chains', 'pearl earrings'],
                'sunglasses': ['oversized sunglasses', 'aviator sunglasses', 'cat-eye sunglasses'],
                'hats': ['wide-brim hat', 'beanie', 'baseball cap'],
                'oversized-sweaters': [], // handled in top
                'tights': [], // handled separately
            };

            const accessories = (persona.signatureItems as string[])
                .filter((s: string) => s !== 'tights' && s !== 'watches') // Filter out items handled separately
                .map((s: string) => {
                    return accessoryMap[s] ? pick(accessoryMap[s]) : '';
                })
                .filter(Boolean)
                .join(', ') || (isMale ? 'minimal accessories' : 'minimal gold jewelry');

            const newOutfit: DailyOutfit = {
                top,
                bottom: bottomDesc,
                footwear: footwearDesc,
                accessories,
                tightsColor,
                outerwear,
            };

            // Save to database (cast to Prisma-compatible JSON type)
            await prisma.persona.update({
                where: { id: personaId },
                data: {
                    dailyOutfit: JSON.parse(JSON.stringify(newOutfit)),
                    dailyOutfitDate: new Date(),
                },
            });

            return newOutfit;
        });

        // Step 2: Daily Plan - Agent decides next activity

        const plan = await step.run('create-daily-plan', async (): Promise<ActivityPlan> => {
            // If this is a retry, reconstruct the plan from memory
            if (retryMemory) {
                return {
                    activity: retryMemory.description.split(' - ')[0],
                    timeOfDay: currentTimeOfDay, // Approximate
                    location: retryMemory.description.includes('at') ? retryMemory.description.split('at ')[1].split(' - ')[0] : 'home',
                    isContentWorthy: true, // Force content for retry
                    estimatedCost: 0,
                    moodImpact: 'positive',
                };
            }

            const recentMemories = persona.memories
                .map((m: { description: string }) => m.description)
                .join(', ')

            const prompt = `
You are planning the next activity for ${persona.name}, a ${persona.personalityVibe} persona living in ${persona.city}.

Current context:
- LOCAL TIME: ${localHour}:00 (${currentTimeOfDay}) - THIS IS CRITICAL, plan activities appropriate for this time!
${environment.weather ? `- Weather: ${environment.weather.condition}, ${environment.weather.temp}°C - ${environment.weather.description}` : '- Weather: Unknown (plan for indoor activities if unsure)'}
- Trending: ${environment.trends.trends.slice(0, 3).join(', ')}
- Current balance: $${persona.currentBalance}
- Recent activities: ${recentMemories || 'Just starting their day'}
- Apartment style: ${persona.apartmentStyle}
- Clothing style: ${persona.clothingStyle}

Based on this context, plan the next activity. Consider:
1. THE TIME OF DAY - Do not plan morning activities in the evening!
2. The weather conditions
3. Their budget
4. Their personality vibe
5. Whether this would be good content (aesthetic lifestyle moments at home ARE content-worthy!)

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
            await updateActivityStatus(personaId, 'active', activityDescription);
        });

        // Step 3: Create memory of the activity
        const memory = await step.run('create-memory', async () => {
            return await prisma.memory.create({
                data: {
                    personaId,
                    description: `${plan.activity} at ${plan.location || 'home'} - ${plan.moodImpact} vibes`,
                    importance: plan.isContentWorthy ? 4 : 2,
                },
            })
        })

        // Step 4: Update wallet if there was spending
        if (plan.estimatedCost > 0) {
            await step.run('update-wallet', async () => {
                return await prisma.persona.update({
                    where: { id: personaId },
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
            await updateActivityStatus(personaId, 'creating', 'Generating content...');

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

            // Handle Persistent Evening Outfit Change
            let currentOutfit = { ...dailyOutfit } as any;
            const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

            if (plan.timeOfDay === 'evening' && !isAtHome && !isWorkout && !currentOutfit.isEvening) {
                // Determine we need to switch to evening wear AND persist it
                const eveningDresses = ['elegant black evening dress', 'red velvet cocktail dress', 'silk slip dress', 'sequin mini dress', 'off-shoulder evening gown'];
                const eveningTops = ['silk camisole', 'black velvet body', 'elegant satin blouse', 'sequin top'];
                const eveningBottoms = ['leather mini skirt', 'long satin skirt', 'tailored wide-leg trousers'];
                const eveningHeels = ['strappy high heels', 'black stiletto heels', 'silver pumps', 'classic court shoes'];

                const isDress = Math.random() > 0.4;

                let newTop = "";
                let newBottom = "";

                if (isDress) {
                    newTop = pick(eveningDresses);
                    newBottom = ""; // Dress covers bottom
                } else {
                    newTop = pick(eveningTops);
                    newBottom = pick(eveningBottoms);
                }

                currentOutfit = {
                    ...currentOutfit,
                    top: newTop,
                    bottom: newBottom,
                    footwear: pick(eveningHeels),
                    accessories: "statement earrings, evening clutch bag",
                    tightsColor: currentOutfit.tightsColor ? currentOutfit.tightsColor : 'black',
                    isEvening: true
                };

                // PERSIST the change to DB so she stays in this outfit
                await prisma.persona.update({
                    where: { id: personaId },
                    data: {
                        dailyOutfit: JSON.parse(JSON.stringify(currentOutfit))
                    }
                });
            }

            if (isWorkout) {
                // Special workout outfit
                outfitDescription = `wearing athletic workout clothes: fitted sports top, comfortable leggings${currentOutfit.tightsColor ? `, ${currentOutfit.tightsColor} athletic tights underneath` : ''}`;
            } else {
                // Regular daily OR persistent evening outfit using currentOutfit
                const topDesc = currentOutfit.top;
                const bottomDesc = currentOutfit.bottom;

                // Footwear varies by context
                let footwearDesc: string;
                if (isAtHome) {
                    // At home: barefoot or slippers (even in evening wear)
                    const homeFootwear = (persona.footwear as string[]).find((f: string) => f === 'barefoot' || f === 'slippers');
                    if (homeFootwear === 'barefoot') {
                        footwearDesc = 'barefoot with no shoes, bare feet visible';
                    } else {
                        footwearDesc = 'wearing cozy indoor slippers';
                    }
                } else {
                    footwearDesc = `wearing ${currentOutfit.footwear}`;
                }

                // Tights with reinforced toe if barefoot
                let tightsDesc = '';
                if (currentOutfit.tightsColor) {
                    const isBarefootOrSlippers = isAtHome && (persona.footwear as string[]).some((f: string) => f === 'barefoot' || f === 'slippers');
                    if (isBarefootOrSlippers) {
                        tightsDesc = `MUST be wearing ${currentOutfit.tightsColor} sheer tights on legs and feet, with reinforced toes (slightly thicker fabric at the toes but still sheer, toes visible through)`;
                    } else {
                        tightsDesc = `MUST be wearing ${currentOutfit.tightsColor} sheer tights on legs`;
                    }
                }

                // Outerwear only outdoors
                const outerwearDesc = !isAtHome && currentOutfit.outerwear
                    ? `, with ${currentOutfit.outerwear} over shoulders`
                    : '';

                outfitDescription = [
                    `wearing ${topDesc}`,
                    bottomDesc,
                    footwearDesc,
                    tightsDesc,
                    currentOutfit.accessories,
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

            const weatherLine = environment.weather
                ? `Weather: ${environment.weather.condition}, ${environment.weather.temp}°C - ${environment.weather.description}.`
                : '';

            const imagePrompt = `A beautiful, Instagram-worthy photo of a ${persona.personalityVibe} persona ${plan.activity} at ${plan.location || 'home'}. 
TIME: ${currentMonth} ${season}, ${localHour}:00 local time (${plan.timeOfDay}) - LIGHTING: ${lightingDescription}.
${weatherLine}
Style: authentic lifestyle photography.
OUTFIT (consistent daily look): ${outfitDescription}.
Location: ${persona.city}, in a ${persona.apartmentStyle} setting.`


            // Generate image with face and room references
            const result = await generatePersonaImage(
                imagePrompt,
                persona.faceReferences,
                persona.roomReferences,
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
                const emoji = environment.weather ? (weatherEmoji[environment.weather.condition] || '🌤️') : '🌤️';

                const caption = environment.weather
                    ? `${plan.activity} ${emoji} ${environment.weather.temp}°C in ${persona.city} ✨ ${timeHashtags[currentTimeOfDay] || '#lifestyle'}`
                    : `${plan.activity} in ${persona.city} ✨ ${timeHashtags[currentTimeOfDay] || '#lifestyle'}`

                // Save image to Supabase Storage
                const imageUrl = await saveGeneratedImage(
                    result.imageBase64,
                    result.mimeType || 'image/png',
                    personaId,
                    'pending'
                )

                const post = await prisma.post.create({
                    data: {
                        personaId,
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

        console.log(`[Lifecycle] ${persona.name} completed activity. Taking a break for ${sleepDuration}.`);

        // Update activity status: RESTING
        await step.run('update-status-resting', async () => {
            await updateActivityStatus(personaId, 'resting', `Taking a ${randomHours}-hour break`);
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
            data: { personaId },
        })

        return {
            persona: persona.name,
            environment,
            plan,
            image,
            video,
            nextCycleIn: sleepDuration,
            localTime: `${localHour}:00`
        }
    }
)

// Function to start the lifecycle for a new persona
export const startLifecycle = inngest.createFunction(
    { id: 'start-lifecycle' },
    { event: 'livra/persona.created' },
    async ({ event, step }) => {
        const personaId = event.data.personaId as string

        // Create initial memory
        await step.run('create-initial-memory', async () => {
            return await prisma.memory.create({
                data: {
                    personaId,
                    description: 'Started a new chapter in life - feeling excited about the journey ahead!',
                    importance: 5,
                },
            })
        })

        // Trigger the first lifecycle cycle
        await step.sendEvent('trigger-first-cycle', {
            name: 'livra/cycle.start',
            data: { personaId },
        })

        return { started: true, personaId }
    }
)

export const functions = [lifecycleCycle, startLifecycle]
