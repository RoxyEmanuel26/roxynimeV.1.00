import { sankaClient } from '../src/lib/sankaClient';

async function testApi() {
    const slug = 'yuusha-party-ni-kawaii-sub-indo';
    const epSlug = 'ypkks-episode-3-sub-indo';

    console.log(`Testing Episode: ${epSlug}`);

    try {
        const res = await fetch(`https://www.sankavollerei.com/anime/episode/${epSlug}`);
        const json = await res.json();

        if (json.data) {
            console.log('DATA KEYS:', Object.keys(json.data));

            if (json.data.mirror) {
                console.log('FOUND MIRROR:', JSON.stringify(json.data.mirror, null, 2));
            }
            if (json.data.server) {
                console.log('FOUND SERVER (singular):', JSON.stringify(json.data.server, null, 2));
            }
            if (json.data.servers) {
                console.log('FOUND SERVERS (plural):', JSON.stringify(json.data.servers, null, 2));
            }
        } else {
            console.log('NO DATA OBJECT');
        }

    } catch (e: any) {
        console.error('ERROR:', e.message);
    }
}

testApi();
