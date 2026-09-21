const urls = [
  "https://raw.githubusercontent.com/Dicklesworthstone/beads-for-frankentui/main/viewer.js",
  "https://raw.githubusercontent.com/Dicklesworthstone/beads-for-frankentui/main/index.html",
  "https://raw.githubusercontent.com/Dicklesworthstone/beads-for-frankentui/main/styles.css",
  "https://raw.githubusercontent.com/Dicklesworthstone/beads-for-frankentui/main/wasm_loader.js",
  "https://raw.githubusercontent.com/Dicklesworthstone/beads-for-frankentui/main/hybrid_scorer.js",
];

for (const url of urls) {
  const name = url.split("/").pop();
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.statusText}`);
    const text = await resp.text();
    await Bun.write(name, text);
    console.log(`Fetched ${name}`);
  } catch (e) {
    console.error(e);
  }
}
