import { NextResponse } from 'next/server';
import { validateAndNormalizeCity } from '@/lib/location-validator';

export async function POST(req: Request) {
    try {
        const { city, countryCode } = await req.json();

        if (!city || !countryCode) {
            return NextResponse.json({ error: 'City and countryCode are required' }, { status: 400 });
        }

        const validation = await validateAndNormalizeCity(city, countryCode);
        return NextResponse.json(validation);
    } catch (error) {
        console.error('Location validation error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
