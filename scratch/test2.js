async function test() {
    try {
        const res = await fetch("http://localhost:3000/api/anime?type=completed&page=1&source=otakudesu");
        const data = await res.json();
        console.log("hasNext:", data.hasNext);
        console.log("total_item:", data.total_item);
        console.log("totalPages:", data.totalPages);
    } catch(e) {
        console.error(e);
    }
}
test();
