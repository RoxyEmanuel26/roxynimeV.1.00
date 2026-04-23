async function test() {
    try {
        const url = "https://www.sankavollerei.com/anime/donghua/home";
        console.log(`Fetching from: ${url}`);
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response length: ${text.length}`);
        console.log(`Response snippet: ${text.substring(0, 200)}`);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
