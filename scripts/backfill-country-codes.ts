/**
 * Migration script to backfill countryCode for existing personas
 * Run: npx tsx scripts/backfill-country-codes.ts
 */

// IMPORTANT: Load env vars FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Use PrismaClient directly for scripts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getCountryByName } from '../src/lib/countries';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Manual mapping for common country names to ISO codes
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
    'Poland': 'PL',
    'United States': 'US',
    'USA': 'US',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Germany': 'DE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'Netherlands': 'NL',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Belgium': 'BE',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Ireland': 'IE',
    'Canada': 'CA',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Japan': 'JP',
    'China': 'CN',
    'South Korea': 'KR',
    'India': 'IN',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Pakistan': 'PK',
    'Bangladesh': 'BD',
    'United Arab Emirates': 'AE',
    'UAE': 'AE',
    'Saudi Arabia': 'SA',
    'Israel': 'IL',
    'Turkey': 'TR',
    'Egypt': 'EG',
    'South Africa': 'ZA',
    'Nigeria': 'NG',
    'Kenya': 'KE',
    'Morocco': 'MA',
    'Australia': 'AU',
    'New Zealand': 'NZ',
};

async function backfillCountryCodes() {
    console.log('🔄 Starting country code backfill...\n');

    // Get all personas without countryCode
    const personas = await prisma.persona.findMany({
        where: {
            OR: [
                { countryCode: null },
                { countryCode: '' },
            ],
        },
        select: {
            id: true,
            name: true,
            country: true,
            city: true,
        },
    });

    console.log(`Found ${personas.length} personas to update\n`);

    let updated = 0;
    let failed = 0;

    for (const persona of personas) {
        try {
            // Try to map country name to code
            const countryCode = COUNTRY_NAME_TO_CODE[persona.country] ||
                getCountryByName(persona.country)?.code ||
                'US'; // Default fallback

            await prisma.persona.update({
                where: { id: persona.id },
                data: {
                    countryCode,
                    cityLocal: persona.city, // Keep original city name as local
                },
            });

            console.log(`✅ ${persona.name}: ${persona.country} → ${countryCode} (${persona.city})`);
            updated++;
        } catch (error) {
            console.error(`❌ Failed to update ${persona.name}:`, error);
            failed++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${personas.length}`);

    await prisma.$disconnect();
}

backfillCountryCodes().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
