
async function testGenreResponse() {
    console.log("Testing genre endpoint to see ID format...\n");

    const url = "https://www.sankavollerei.com/anime/genre/action?page=1";

    try {
        const res = await fetch(url);
        const data = await res.json();
        const list = data.data?.animeList || [];

        console.log(`Found ${list.length} items\n`);

        // Show first 5 items' IDs
        for (let i = 0; i < Math.min(5, list.length); i++) {
            const item = list[i];
            console.log(`Item ${i + 1}:`);
            console.log(`  animeId: ${item.animeId}`);
            console.log(`  id: ${item.id}`);
            console.log(`  slug: ${item.slug}`);
            console.log(`  title: ${item.title}`);
            console.log("");
        }

        // Test fetching detail for first item
        if (list.length > 0) {
            const firstId = list[0].animeId || list[0].slug || list[0].id;
            console.log(`\n--- Testing detail for first item: ${firstId} ---`);

            const detailUrl = `https://www.sankavollerei.com/anime/anime/${firstId}`;
            console.log(`URL: ${detailUrl}`);

            const detailRes = await fetch(detailUrl);
            console.log(`Status: ${detailRes.status}`);

            if (detailRes.ok) {
                const detailData = await detailRes.json();
                console.log(`Title: ${detailData.data?.title || 'N/A'}`);
            }
        }
    } catch (e: any) {
        console.log(`Error: ${e.message}`);
    }
}

testGenreResponse();
