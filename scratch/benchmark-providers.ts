import { getProvider } from '../src/lib/providers/index';
const providers = ['otakudesu', 'samehadaku', 'donghua', 'oploverz', 'winbu'];

async function benchmark() {
  for (const name of providers) {
    const p = getProvider(name);
    const start = Date.now();
    try {
      const result = await p.getCompleted(1);
      const elapsed = Date.now() - start;
      console.log(`${name}: ${elapsed}ms — ${result.data.length} items`);
    } catch (e: any) {
      const elapsed = Date.now() - start;
      console.log(`${name}: ${elapsed}ms — ERROR: ${e.message}`);
    }
  }
}
benchmark();
