import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { getOrCreateUser } from "@/lib/auth";

// Timezone mapping for cities
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
};

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
    } catch {
        return new Date().getUTCHours();
    }
}
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { active } = await req.json();

    try {
        const user = await getOrCreateUser();
        // Get current persona state including city for timezone
        const current = await prisma.persona.findUnique({
            where: { id },
            select: { lifecycleStartedAt: true, lifecycleStatus: true, city: true, userId: true }
        });

        if (!current) {
            return NextResponse.json({ error: "Persona not found" }, { status: 404 });
        }

        if (current.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const isFirstStart = active && !current.lifecycleStartedAt;
        const isResume = active && current.lifecycleStatus === 'paused';

        // Determine initial activity based on local time
        let initialActivity: string | null = null;
        let activityDetails: string | null = null;

        if (active) {
            const localHour = getLocalHour(current.city);
            const isNight = localHour >= 23 || localHour < 7;

            if (isNight) {
                initialActivity = 'sleeping';
                activityDetails = `Sleeping until morning (${current.city} local time: ${localHour}:00)`;
            } else {
                initialActivity = 'planning';
                activityDetails = 'Checking environment and planning next activity...';
            }
        }

        // Update persona status
        const persona = await prisma.persona.update({
            where: { id },
            data: {
                isActive: active,
                lifecycleStatus: active ? 'running' : 'paused',
                // Set lifecycleStartedAt only on first start
                ...(isFirstStart && { lifecycleStartedAt: new Date() }),
                // Set time-aware activity on start/resume, clear on pause
                currentActivity: initialActivity,
                activityDetails: activityDetails,
                activityStartedAt: active ? new Date() : null,
            },
        });

        // Send event on first start OR resume (to restart the cycle)
        if (active && (isFirstStart || isResume)) {
            await inngest.send({
                name: 'livra/cycle.start',
                data: { personaId: id },
            });
        }

        // Send stop event on pause to cancel running functions
        if (!active) {
            await inngest.send({
                name: 'livra/cycle.stop',
                data: { personaId: id },
            });
        }

        return NextResponse.json({
            success: true,
            active: persona.isActive,
            lifecycleStatus: persona.lifecycleStatus,
            currentActivity: persona.currentActivity,
            isFirstStart,
            isResume
        });
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

