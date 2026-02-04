const https = require('https');

const url = "https://www.sankavollerei.com/anime/ongoing-anime?page=1";
console.log('Fetching:', url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Root keys:', Object.keys(json));
            if (json.data) {
                console.log('Data keys:', Object.keys(json.data));
                if (json.data.ongoing) {
                    console.log('Ongoing keys:', Object.keys(json.data.ongoing));
                }
            }
            console.log('Full JSON (truncated):', JSON.stringify(json).substring(0, 500));

            console.log('Pagination Object:', JSON.stringify(json.pagination, null, 2));
            console.log('Data Pagination:', JSON.stringify(json.data?.pagination, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data start:', data.substring(0, 200));
        }
    });
}).on('error', (e) => {
    console.error("Error:", e.message);
});
