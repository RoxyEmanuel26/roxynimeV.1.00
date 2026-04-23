async function test() {
    try {
        const res = await fetch("https://www.sankavollerei.com/anime/otakudesu/complete-anime?page=1");
        const data = await res.json();
        console.log("Pagination keys:", data.pagination ? Object.keys(data.pagination) : "No pagination");
        console.log("HasNextPage value:", data.pagination ? data.pagination.hasNextPage : undefined);
        console.log("Has_Next_Page value:", data.pagination ? data.pagination.has_next_page : undefined);
    } catch(e) {
        console.error(e);
    }
}
test();
