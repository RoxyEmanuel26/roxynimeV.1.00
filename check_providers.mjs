const BASE = "https://www.sankavollerei.com";

async function checkProvider(name, url, extract) {
  try {
    const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) { console.log(`${name}: HTTP ${r.status}`); return; }
    const d = await r.json();
    const list = extract(d);
    if (!list || list.length === 0) { console.log(`${name}: no data`); return; }
    const item = list[0];
    console.log(`\n=== ${name.toUpperCase()} ===`);
    console.log("Fields:", Object.keys(item).join(", "));
    console.log("Sample:", JSON.stringify({
      title: (item.title || "").substring(0, 45),
      episode: item.episode,
      episodes: item.episodes,
      current_episode: item.current_episode,
      score: item.score,
      rating: item.rating,
      status: item.status,
      type: item.type,
    }));
  } catch (e) {
    console.log(`${name}: ERROR - ${e.message}`);
  }
}

await checkProvider("anoboy-home", `${BASE}/anime/anoboy/home`, d => d.anime_list);
await checkProvider("samehadaku-home", `${BASE}/anime/samehadaku/home`, d => d.data?.recent?.animeList);
await checkProvider("oploverz-home", `${BASE}/anime/oploverz/home`, d => d.anime_list);
await checkProvider("donghua-latest", `${BASE}/anime/donghua/home`, d => d.latest_release);
await checkProvider("donghua-completed", `${BASE}/anime/donghua/home`, d => d.completed_donghua);
await checkProvider("otakudesu-ongoing", `${BASE}/anime/ongoing-anime?page=1`, d => d.data?.animeList);
await checkProvider("otakudesu-completed", `${BASE}/anime/complete-anime?page=1`, d => d.data?.animeList);
await checkProvider("kuramanime-home", `${BASE}/anime/kuramanime/home`, d => d.data?.animeList || d.data?.recent || d.data);
