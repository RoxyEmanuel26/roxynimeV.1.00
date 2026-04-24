

async function test() {
    const SANKA_API_BASE = "https://www.sankavollerei.com";
    const res = await fetch(`${SANKA_API_BASE}/anime/search/one%20piece`);
    const data = await res.json();
    console.log(JSON.stringify(data.data.animeList[0] || data.data[0], null, 2));
}

test();
