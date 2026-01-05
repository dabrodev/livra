import { config } from 'dotenv';
config({ path: '.env.local' });

import { inngest } from '../src/inngest/client';

async function restartBeata() {
    const influencerId = 'b218e7e4-efb4-415d-8045-b6ddb7acbdee';

    console.log('Sending cycle.stop...');
    await inngest.send({
        name: 'livra/cycle.stop',
        data: { influencerId },
    });

    // Wait a bit to ensure cancellation processes
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Sending cycle.start...');
    await inngest.send({
        name: 'livra/cycle.start',
        data: { influencerId },
    });

    console.log('Done!');
}

restartBeata().catch(console.error);
