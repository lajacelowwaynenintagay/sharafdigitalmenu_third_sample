import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_KEY = "AIzaSyC-0da7Nex5O3KfBL0kGF9nJoradGrx6ds";
const ORIGIN = "https://tgo.4d-menu.com";
const DB_ORIGIN =
  "https://d-smart-menu-orders-default-rtdb.asia-southeast1.firebasedatabase.app";
const RESTAURANT_SLUG = "the-golden-oak";

const ROOT = process.cwd();
const mirrorRoot = path.join(ROOT, "public", "mirror", RESTAURANT_SLUG);
const imageDir = path.join(mirrorRoot, "images");
const assetDir = path.join(mirrorRoot, "assets");
const videoDir = path.join(mirrorRoot, "videos");

async function ensureDirs() {
  await Promise.all([
    mkdir(mirrorRoot, { recursive: true }),
    mkdir(imageDir, { recursive: true }),
    mkdir(assetDir, { recursive: true }),
    mkdir(videoDir, { recursive: true }),
  ]);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status}`);
  }
  return response.json();
}

async function download(url, destinationFile) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${url}: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(destinationFile, bytes);
}

async function getAnonymousAuthToken() {
  const payload = await fetchJson(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );

  return payload.idToken;
}

async function main() {
  await ensureDirs();

  const [menuData, authToken] = await Promise.all([
    fetchJson(`${ORIGIN}/data-box/${RESTAURANT_SLUG}/menu-data.json`),
    getAnonymousAuthToken(),
  ]);

  const menuStatus = await fetchJson(
    `${DB_ORIGIN}/restaurants/${RESTAURANT_SLUG}/menu_status.json?auth=${encodeURIComponent(authToken)}`,
  );

  await Promise.all([
    download(
      `${ORIGIN}/assets/logo+text_right.png`,
      path.join(assetDir, "logo+text_right.png"),
    ),
    download(`${ORIGIN}/assets/favicon.png`, path.join(assetDir, "favicon.png")),
    download(
      `${ORIGIN}/data-box/${RESTAURANT_SLUG}/title_bg.mp4`,
      path.join(videoDir, "title_bg.mp4"),
    ),
    download(
      `${ORIGIN}/data-box/${RESTAURANT_SLUG}/title_bg_light.mp4`,
      path.join(videoDir, "title_bg_light.mp4"),
    ),
  ]);

  const imageJobs = menuData.items.map(async (item) => {
    const remote = `${ORIGIN}/data-box/${RESTAURANT_SLUG}/${encodeURIComponent(item.title.en)}.png`;
    const localFilename = `${item.id}.png`;
    const localPath = path.join(imageDir, localFilename);

    try {
      await download(remote, localPath);
      return { ...item, image: `/mirror/${RESTAURANT_SLUG}/images/${localFilename}` };
    } catch {
      return { ...item, image: "/images/placeholder-dish.svg" };
    }
  });

  const mirroredItems = await Promise.all(imageJobs);
  const mirroredData = { ...menuData, items: mirroredItems };

  await Promise.all([
    writeFile(
      path.join(mirrorRoot, "menu-data.json"),
      JSON.stringify(mirroredData, null, 2),
      "utf8",
    ),
    writeFile(
      path.join(mirrorRoot, "menu-status.json"),
      JSON.stringify(menuStatus ?? {}, null, 2),
      "utf8",
    ),
    writeFile(
      path.join(mirrorRoot, "restaurant-meta.json"),
      JSON.stringify(
        {
          slug: RESTAURANT_SLUG,
          source: ORIGIN,
          generatedAt: new Date().toISOString(),
          itemCount: mirroredItems.length,
        },
        null,
        2,
      ),
      "utf8",
    ),
  ]);

  console.log(
    `Mirrored ${mirroredItems.length} items and ${Object.keys(menuStatus ?? {}).length} status entries to public/mirror/${RESTAURANT_SLUG}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
