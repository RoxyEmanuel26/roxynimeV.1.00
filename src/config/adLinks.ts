/**
 * ═══════════════════════════════════════════════
 *   RoxyNime — Ad Direct Links (Two-Click System)
 * ═══════════════════════════════════════════════
 *
 *  These are the monetization links opened on the
 *  FIRST click. The second click goes to the actual
 *  destination. Add or remove links as needed.
 */

export const AD_DIRECT_LINKS: string[] = [
    // ── Glamour Links ────────────────────────────
    "https://glamournakedemployee.com/dktyyvhhvs?key=2135b8086ad561259d59a35e74d4dae3",
    "https://glamournakedemployee.com/bxj9v8xs?key=bbcc03541721fe595f6d0a199086c628",
    "https://glamournakedemployee.com/d1ydygn4?key=ae04db9758f66d571a2d122b08635af3",
    "https://glamournakedemployee.com/c5xf7679?key=80dc863578016519ca9167abc7090944",
    "https://glamournakedemployee.com/npkvzf46m?key=8060ea72a291acdeae897405426a6013",
    "https://glamournakedemployee.com/xdn13p8ti?key=d9dbf00859cec6d1da89b3855b9f40df",
    "https://glamournakedemployee.com/r0ue7gdeb8?key=0f351b4656e9db04d06bdd25deb60f05",
    "https://glamournakedemployee.com/vfag6svjx?key=ba78cf78789f91aa7ace1942fce8a322",
    "https://glamournakedemployee.com/jpnevpwu8?key=53b3ae6972e09ad30eb53ce3f99890a5",
    "https://glamournakedemployee.com/xdi7pkz9wh?key=46862d356a0f361ac92be23fe00a265a",

    // ── OMG Links ────────────────────────────────
    "https://omg10.com/4/10806721",
    "https://omg10.com/4/10806736",
    "https://omg10.com/4/10806719",
    "https://omg10.com/4/10806723",
    "https://omg10.com/4/10806731",
    "https://omg10.com/4/10806726",
    "https://omg10.com/4/10806729",
    "https://omg10.com/4/10806728",
    "https://omg10.com/4/10806730",
    "https://omg10.com/4/10806727",
];

/** Pick a random ad link */
export function getRandomAdLink(): string {
    return AD_DIRECT_LINKS[Math.floor(Math.random() * AD_DIRECT_LINKS.length)];
}
