import { getProvider } from '../src/lib/providers/index';
const providers = ['otakudesu', 'samehadaku', 'donghua', 'anoboy', 'oploverz', 'winbu'];

async function testAll() {
  const results: any = {};
  for (const name of providers) {
    console.log(`\nTesting ${name}...`);
    results[name] = { search: 'FAIL', detail: 'FAIL', stream: 'FAIL', completed: 'FAIL', ongoing: 'FAIL' };
    const p = getProvider(name);
    
    // Test completed
    try {
      const comp = await p.getCompleted(1);
      if (comp?.data?.length > 0) {
        results[name].completed = `OK (${comp.data.length} items)`;
      } else {
        results[name].completed = 'EMPTY';
      }
    } catch(e: any) { results[name].completed = `ERR: ${e.message}`; }
    
    // Test ongoing
    try {
      const ong = await p.getOngoing(1);
      if (ong?.data?.length > 0) {
        results[name].ongoing = `OK (${ong.data.length} items)`;
      } else {
        results[name].ongoing = 'EMPTY';
      }
    } catch(e: any) { results[name].ongoing = `ERR: ${e.message}`; }

    // Test search
    try {
      let q = 'naruto';
      if(name==='donghua') q = 'martial';
      const searchRes = await p.search(q);
      if (searchRes?.data?.length > 0) {
        results[name].search = 'OK';
        const animeId = searchRes.data[0].id;
        try {
          const detail = await p.getDetail(animeId);
          if (detail && detail.episodes?.length > 0) {
            results[name].detail = 'OK';
            const epId = detail.episodes[0].id || detail.episodes[0].urlSlug;
            try {
              const streams = await p.getStreams(epId);
              if (streams && streams.length > 0) {
                results[name].stream = 'OK';
              }
            } catch(e: any) { console.error(`[${name}] Stream error:`, e.message); }
          }
        } catch(e: any) { console.error(`[${name}] Detail error:`, e.message); }
      }
    } catch (e: any) {
      console.error(`[${name}] Search error:`, e.message);
    }
    console.log(`Result for ${name}:`, results[name]);
  }
  console.log('\n--- FINAL SUMMARY ---');
  console.table(results);
}
testAll();
